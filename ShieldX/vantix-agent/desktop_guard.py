"""
Vantix Desktop Guard
====================
Monitors typing in user-selected desktop applications.
New in this version:
  - App Selector (tkinter UI) for choosing which apps to watch
  - Keyboard hook via pynput (only fires when watched app is focused)
  - Enhanced phone + email + env-key detection on typed text

Dependencies:
    pip install pynput pygetwindow phonenumbers
"""

import os
import re
import json
import threading
import time

# ── Optional imports — fail gracefully ────────────────────────────────────────
try:
    import pygetwindow as gw
    HAS_GW = True
except Exception:
    HAS_GW = False

try:
    from pynput import keyboard as pynput_keyboard
    HAS_PYNPUT = True
except Exception:
    HAS_PYNPUT = False

try:
    import phonenumbers
    HAS_PHONENUMBERS = True
except Exception:
    HAS_PHONENUMBERS = False

# ── Config path ───────────────────────────────────────────────────────────────
CONFIG_PATH = os.path.expanduser("~/.vantix/desktop_guard.json")
DEFAULT_WATCHLIST = [
    "ChatGPT", "Claude", "Gemini", "Copilot",
    "LM Studio", "Jan", "AnythingLLM", "Perplexity",
    "Slack", "Microsoft Teams", "Notepad",
]

# ── Global state ──────────────────────────────────────────────────────────────
_watchlist: list[str] = []
_key_buffer: list[str] = []
_buffer_lock = threading.Lock()
_violation_callback = None   # set by agent.py
BUFFER_MAX = 300             # characters to keep in the sliding window

def set_watchlist(apps: list[str]):
    global _watchlist
    _watchlist = [str(app).strip() for app in apps if str(app).strip()]
    print(f"[DesktopGuard] Dynamic watchlist updated: {_watchlist}")

# ── Enhanced Detection Patterns ───────────────────────────────────────────────

# Phone: Universal 10-digit formats with or without country code
# Strict boundaries prevent matching inside 16-digit card numbers
PHONE_PATTERNS = [
    r'(?<!\d)[6-9]\d{9}(?!\d)|(?:\+91[\s\-]?)?[6-9]\d{9}(?!\d)|(?:\+?[1-9]\d{0,2}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}(?!\d)'
]

# Email: standard + obfuscated variants
EMAIL_PATTERNS = [
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',   # standard
    r'[a-zA-Z0-9._%+\-]+\s*\(at\)\s*[a-zA-Z0-9.\-]+\s*\(dot\)\s*[a-zA-Z]{2,}',  # (at)(dot)
    r'[a-zA-Z0-9._%+\-]+\s*\[at\]\s*[a-zA-Z0-9.\-]+\s*\[dot\]\s*[a-zA-Z]{2,}',  # [at][dot]
    r'[a-zA-Z0-9._%+\-]+\s+at\s+[a-zA-Z0-9.\-]+\s+dot\s+[a-zA-Z]{2,}',          # at dot
]

# .env / secret keys: KEY=VALUE pairs
ENV_KEY_PATTERNS = [
    r'[A-Z_]{3,}(?:KEY|SECRET|TOKEN|PASSWORD|PASS|PWD|API|APIKEY)\s*=\s*\S+',
    r'(?:export\s+)?[A-Z_]{3,}=["\'`]?[a-zA-Z0-9+/=_\-]{16,}["\'`]?',
    r'sk-proj-[a-zA-Z0-9_\-]{40,}',   # OpenAI project key
    r'xoxb-[0-9]{11}-[0-9]{13}-[a-zA-Z0-9]{24}',          # Slack bot token
    r'discord_token\s*=\s*[A-Za-z0-9._\-]+',              # Discord token
]

ALL_DESKTOP_PATTERNS = {
    # Critical — auto-mask
    "Phone Number":   (PHONE_PATTERNS, "critical"),
    "Email Address":  (EMAIL_PATTERNS, "moderate"),
    "ENV/Secret Key": (ENV_KEY_PATTERNS, "critical"),
    "Aadhaar":        ([r'(?<!\d)\d{4}[\s\-]?\d{4}[\s\-]?\d{4}(?!\d)|(?<!\d)[2-9]\d{11}(?!\d)'], "critical"),
    "PAN Card":       ([r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'], "critical"),
    "Credit Card":    ([r'(?<!\d)(?:\d{4}[\s\-]?){3}\d{4}(?!\d)|(?<!\d)\d{16}(?!\d)'], "critical"),
}


def scan_text(text: str) -> list[dict]:
    """
    Run all enhanced patterns against text.
    Returns list of {type, value, severity}.
    """
    hits = []
    seen_vals = set()  # De-duplicate same value across patterns
    for label, (patterns, severity) in ALL_DESKTOP_PATTERNS.items():
        for pat in patterns:
            for m in re.finditer(pat, text, re.IGNORECASE):
                val = m.group().strip()
                if len(val) < 6:
                    continue
                dedup_key = (label, val)
                if dedup_key in seen_vals:
                    continue
                seen_vals.add(dedup_key)
                hits.append({"type": label, "value": val, "severity": severity})
    return hits


# ── Config helpers ─────────────────────────────────────────────────────────────

def load_watchlist() -> list[str]:
    """Load saved watchlist from config file."""
    try:
        with open(CONFIG_PATH) as f:
            data = json.load(f)
            return data.get("watchlist", [])
    except Exception:
        return []


def save_watchlist(apps: list[str]):
    """Persist watchlist to config file."""
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    with open(CONFIG_PATH, "w") as f:
        json.dump({"watchlist": apps}, f, indent=2)


# ── App Selector UI ───────────────────────────────────────────────────────────

def show_app_selector(on_save=None):
    """
    Show a tkinter window listing running apps + default AI apps.
    User checks which ones Vantix should monitor.
    Calls on_save(watchlist) when confirmed.
    """
    import tkinter as tk

    BG     = "#0d1117"
    BORDER = "#1e2530"
    TEAL   = "#00d4aa"
    TEXT   = "#f0f6ff"
    SUBTLE = "#4a5568"
    ROW_BG = "#0f1520"

    # Gather currently open window titles + defaults
    running_titles = []
    if HAS_GW:
        try:
            running_titles = [w.title for w in gw.getAllWindows() if w.title.strip()]
        except Exception:
            pass

    # Combine defaults + running, de-duplicate
    combined = list(dict.fromkeys(DEFAULT_WATCHLIST + running_titles))
    saved    = load_watchlist()

    root = tk.Tk()
    root.title("Vantix — App Guard Setup")
    root.configure(bg=BG)
    root.resizable(False, False)
    root.attributes("-topmost", True)

    w, h = 480, 580
    sx = (root.winfo_screenwidth()  // 2) - (w // 2)
    sy = (root.winfo_screenheight() // 2) - (h // 2)
    root.geometry(f"{w}x{h}+{sx}+{sy}")

    # Header
    header = tk.Frame(root, bg=BG)
    header.pack(fill="x", padx=24, pady=(18, 0))
    tk.Label(header, text="\U0001f6e1", bg=BG, fg=TEAL, font=("Segoe UI", 20)).pack(anchor="w")
    tk.Label(header, text="Select apps for Vantix to guard",
             bg=BG, fg=TEXT, font=("Segoe UI", 13, "bold")).pack(anchor="w", pady=(4, 0))
    tk.Label(header, text="Vantix will scan your typing in these applications",
             bg=BG, fg=SUBTLE, font=("Segoe UI", 10)).pack(anchor="w", pady=(2, 0))
    tk.Frame(root, bg=BORDER, height=1).pack(fill="x", padx=24, pady=(12, 0))

    # Scrollable list
    container = tk.Frame(root, bg=BG)
    container.pack(fill="both", expand=True, padx=24, pady=(8, 0))
    canvas = tk.Canvas(container, bg=BG, highlightthickness=0, bd=0)
    sb = tk.Scrollbar(container, orient="vertical", command=canvas.yview)
    inner = tk.Frame(canvas, bg=BG)
    inner.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
    cw = canvas.create_window((0, 0), window=inner, anchor="nw")
    canvas.bind("<Configure>", lambda e: canvas.itemconfig(cw, width=e.width))
    canvas.configure(yscrollcommand=sb.set)
    canvas.pack(side="left", fill="both", expand=True)
    sb.pack(side="right", fill="y")
    canvas.bind_all("<MouseWheel>", lambda e: canvas.yview_scroll(int(-1*(e.delta/120)), "units"))

    vars_ = {}
    for app in combined:
        var = tk.BooleanVar(value=(app in saved))
        row = tk.Frame(inner, bg=ROW_BG, pady=6)
        row.pack(fill="x", pady=1)
        tk.Checkbutton(
            row, variable=var, bg=ROW_BG,
            activebackground=ROW_BG, selectcolor=BG,
            fg="#ffffff", highlightthickness=0, bd=0,
        ).pack(side="left", padx=(10, 6))
        tk.Label(row, text=app, bg=ROW_BG, fg=TEXT,
                 font=("Segoe UI", 10)).pack(side="left")
        vars_[app] = var

    # Custom app entry
    tk.Frame(root, bg=BORDER, height=1).pack(fill="x", padx=24, pady=(8, 0))
    custom_frame = tk.Frame(root, bg=BG)
    custom_frame.pack(fill="x", padx=24, pady=(8, 0))
    tk.Label(custom_frame, text="Add custom app:", bg=BG, fg=SUBTLE,
             font=("Segoe UI", 9)).pack(side="left")
    custom_entry = tk.Entry(custom_frame, bg="#1a2030", fg=TEXT,
                            insertbackground=TEXT, relief="flat",
                            font=("Segoe UI", 10), width=22)
    custom_entry.pack(side="left", padx=(8, 6))

    def add_custom():
        val = custom_entry.get().strip()
        if val and val not in vars_:
            var = tk.BooleanVar(value=True)
            row = tk.Frame(inner, bg=ROW_BG, pady=6)
            row.pack(fill="x", pady=1)
            tk.Checkbutton(row, variable=var, bg=ROW_BG,
                           activebackground=ROW_BG, selectcolor=BG,
                           fg="#ffffff", highlightthickness=0, bd=0).pack(side="left", padx=(10, 6))
            tk.Label(row, text=val, bg=ROW_BG, fg=TEXT,
                     font=("Segoe UI", 10)).pack(side="left")
            vars_[val] = var
            custom_entry.delete(0, "end")

    tk.Button(custom_frame, text="Add", bg=TEAL, fg="#021a14",
              font=("Segoe UI", 9, "bold"), relief="flat",
              padx=10, command=add_custom).pack(side="left")

    # Save button
    tk.Frame(root, bg=BORDER, height=1).pack(fill="x", padx=24, pady=(8, 0))
    btn_frame = tk.Frame(root, bg=BG)
    btn_frame.pack(fill="x", padx=24, pady=(12, 16))

    def save_and_close():
        selected = [app for app, v in vars_.items() if v.get()]
        save_watchlist(selected)
        if on_save:
            on_save(selected)
        print(f"[Vantix] App watchlist saved: {selected}")
        root.destroy()

    tk.Button(btn_frame, text="Save & Start Guarding",
              bg=TEAL, fg="#021a14", font=("Segoe UI", 10, "bold"),
              relief="flat", padx=16, pady=8, cursor="hand2",
              command=save_and_close).pack(side="left")
    tk.Button(btn_frame, text="Skip",
              bg=BORDER, fg="#c8d6e8", font=("Segoe UI", 10),
              relief="flat", padx=16, pady=8, cursor="hand2",
              command=root.destroy).pack(side="left", padx=(8, 0))

    root.mainloop()


# ── Active window helper ───────────────────────────────────────────────────────

def get_active_window_title() -> str:
    if not HAS_GW:
        return ""
    try:
        win = gw.getActiveWindow()
        return win.title if win else ""
    except Exception:
        return ""


def is_watched(title: str, watchlist: list[str]) -> bool:
    title_lower = title.lower()
    return any(app.lower() in title_lower for app in watchlist)


# ── Keyboard Hook ─────────────────────────────────────────────────────────────

def _flush_buffer(callback):
    """Scan current buffer and call callback if violation found."""
    with _buffer_lock:
        text = "".join(_key_buffer)

    if len(text) < 6:
        return

    hits = scan_text(text)
    if hits and callback:
        callback(hits, text, "desktop_typing")


def start_keyboard_hook(watchlist: list[str], violation_callback):
    """
    Start pynput keyboard listener in a background thread.
    Only scans when the active window is in the watchlist.
    """
    if not HAS_PYNPUT:
        print("[Vantix] pynput not available — desktop guard disabled.")
        return

    global _watchlist, _violation_callback
    _watchlist = watchlist
    _violation_callback = violation_callback

    _flush_timer = [None]

    def _trigger_flush():
        t = threading.Thread(
            target=_flush_buffer,
            args=(_violation_callback,),
            daemon=True,
        )
        t.start()

    def _maybe_flush():
        """Debounce the flush: waits 1.0s after the last keypress to scan."""
        if _flush_timer[0] is not None:
            _flush_timer[0].cancel()
        _flush_timer[0] = threading.Timer(1.0, _trigger_flush)
        _flush_timer[0].daemon = True
        _flush_timer[0].start()

    def on_press(key):
        title = get_active_window_title()
        if not is_watched(title, _watchlist):
            return

        try:
            char = key.char
            if char:
                with _buffer_lock:
                    _key_buffer.append(char)
                    if len(_key_buffer) > BUFFER_MAX:
                        _key_buffer.pop(0)
                _maybe_flush()

        except AttributeError:
            # Special key — flush on Space or Enter
            if key in (pynput_keyboard.Key.space, pynput_keyboard.Key.enter):
                _maybe_flush()
            # Clear buffer on Escape
            elif key == pynput_keyboard.Key.esc:
                with _buffer_lock:
                    _key_buffer.clear()

    listener = pynput_keyboard.Listener(on_press=on_press)
    listener.daemon = True
    listener.start()
    print("[Vantix] Desktop Guard keyboard hook active.")
    return listener


# ── Public initialiser called from agent.py ───────────────────────────────────

def init_desktop_guard(violation_callback):
    """
    Load (or ask user to configure) the watchlist,
    then start the keyboard hook.
    Returns the listener thread.
    """
    saved = load_watchlist()

    if not saved:
        # First run — show selector on a background thread so main agent starts
        def _show():
            show_app_selector(on_save=lambda apps: start_keyboard_hook(apps, violation_callback))
        t = threading.Thread(target=_show, daemon=True)
        t.start()
        return None
    else:
        print(f"[Vantix] Desktop Guard watching: {saved}")
        return start_keyboard_hook(saved, violation_callback)

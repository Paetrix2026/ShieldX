import threading
import time
import re
import pygetwindow as gw
from pynput import keyboard

# ── State ─────────────────────────────────────────────────────────────────────
_watchlist = ["chatgpt", "notepad"]
_active_window = ""
_handler = None
_buffer = ""
_monitoring_thread = None
_stop_event = threading.Event()

# ── Patterns ──────────────────────────────────────────────────────────────────
CRITICAL_PATTERNS = {
    "PAN Card":        r'\b[A-Z]{5}[0-9]{4}[A-Z]\b',
    "Bank Account":    r'\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b',
    "Aadhaar":         r'\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b',
    "IFSC Code":       r'\b[A-Z]{4}0[A-Z0-9]{6}\b',
    "OpenAI Key":      r'sk-[a-zA-Z0-9]{16,}',
    "Stripe Key":      r'sk_(?:live|test)_[0-9a-zA-Z]{24,}',
    "Email":           r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    "Generic Secret":  r'ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z\-_]{35}|AKIA[0-9A-Z]{16}',
    "Phone":           r'\b\d{10}\b',
}

def set_watchlist(apps):
    global _watchlist
    _watchlist = [a.lower().strip() for a in apps if a.strip()]
    print(f"[DesktopGuard] Watchlist updated: {_watchlist}")

def init_desktop_guard(handler_callback):
    global _handler, _monitoring_thread
    _handler = handler_callback
    if not _monitoring_thread:
        _monitoring_thread = threading.Thread(target=_monitor_loop, daemon=True)
        _monitoring_thread.start()
        print("[DesktopGuard] Monitoring thread active.")

def _on_press(key):
    global _buffer
    try:
        char = ""
        is_delimiter = False
        
        if hasattr(key, 'char') and key.char:
            char = key.char
        elif key == keyboard.Key.space:
            char = " "
            is_delimiter = True
        elif key == keyboard.Key.enter:
            char = "\n"
            is_delimiter = True
        elif key == keyboard.Key.backspace:
            _buffer = _buffer[:-1]
            return

        _buffer += char
        if len(_buffer) > 2000:
            _buffer = _buffer[-1000:]

        # TRIGGER ONLY ON SPACE OR ENTER
        if is_delimiter:
            _scan_buffer()
            
    except Exception:
        pass

def _scan_buffer():
    global _buffer
    hits = []
    
    # Priority: Check longest patterns first
    sorted_items = sorted(CRITICAL_PATTERNS.items(), key=lambda x: len(x[1]), reverse=True)
    
    current_buffer = _buffer
    for name, pattern in sorted_items:
        match = re.search(pattern, current_buffer)
        if match:
            hits.append({"type": name, "value": match.group()})
            # Clean up both current view and the global buffer
            current_buffer = current_buffer.replace(match.group(), "*" * len(match.group()))
            _buffer = _buffer.replace(match.group(), "*" * len(match.group()))
            
    if hits and _handler:
        _handler(hits, _buffer, _active_window)

def _monitor_loop():
    global _active_window, _buffer
    listener = None
    while not _stop_event.is_set():
        try:
            win = gw.getActiveWindow()
            title = win.title.lower() if win and win.title else ""
            should_monitor = any(app in title for app in _watchlist)
            
            if should_monitor and not listener:
                _active_window = win.title
                _buffer = ""
                listener = keyboard.Listener(on_press=_on_press)
                listener.start()
            elif not should_monitor and listener:
                listener.stop()
                listener = None
        except Exception:
            pass
        time.sleep(1.5)

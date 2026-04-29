import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agent import CRITICAL_PATTERNS, MODERATE_PATTERNS, mask_text, check_critical, check_moderate

print("=== Pattern Compilation Check ===")
all_ok = True
for name, pat in CRITICAL_PATTERNS.items():
    try:
        re.compile(pat)
        print(f"  OK  CRITICAL: {name}")
    except re.error as e:
        print(f"  ERR CRITICAL: {name} -> {e}")
        all_ok = False

for name, pat in MODERATE_PATTERNS.items():
    try:
        re.compile(pat)
        print(f"  OK  MODERATE: {name}")
    except re.error as e:
        print(f"  ERR MODERATE: {name} -> {e}")
        all_ok = False

if all_ok:
    print("  All patterns compiled successfully.\n")

print("=== Detection Tests ===")
tests = [
    ("Aadhaar (spaces)",    "1234 5678 9012"),
    ("Aadhaar (dashes)",    "1234-5678-9012"),
    ("Aadhaar (no sep)",    "123456789012"),
    ("Email standard",      "user@gmail.com"),
    ("Email obfuscated",    "user (at) gmail (dot) com"),
    ("Phone Indian",        "9876543210"),
    ("Phone +91",           "+91 9876543210"),
    ("Phone Intl",          "+1 415-555-0100"),
    ("Phone US",            "(415) 555-0100"),
    ("OpenAI Key",          "sk-" + "a"*48),
    ("OpenAI Proj Key",     "sk-proj-" + "a"*45),
    ("AWS Key",             "AKIA" + "A"*16),
    ("GitHub Token",        "ghp_" + "a"*36),
    ("ENV Secret",          "API_KEY=mysecretvalue123456"),
    ("Slack Token",         "xoxb-12345678901-1234567890123-" + "a"*24),
    ("Credit Card",         "4111 1111 1111 1111"),
    ("PAN",                 "ABCDE1234F"),
    ("Gmail in sentence",   "Please email me at john.doe@gmail.com tomorrow"),
    ("Phone in sentence",   "Call me on 9876543210 after 5pm"),
]

for label, sample in tests:
    crit = check_critical(sample)
    mod  = check_moderate(sample)
    found = crit + [d["type"] for d in mod]
    status = "DETECTED" if found else "MISSED  "
    print(f"  [{status}] {label}: {found if found else 'nothing detected'}")

print()
print("=== mask_text test ===")
sample = "My email is test@gmail.com and phone is 9876543210, PAN: ABCDE1234F, key: API_KEY=secret12345678"
print("Input :", sample)
print("Masked:", mask_text(sample))

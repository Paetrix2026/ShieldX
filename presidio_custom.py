"""
Vantix — Custom Presidio Pattern Recognizers (India-Focused)
=============================================================
This script adds India-specific and developer-specific patterns
while filtering out irrelevant region-specific entities (like US-only data).

Usage:
    python presidio_custom.py          → runs a local Flask server on :5002
"""

from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer
from flask import Flask, request, jsonify

app = Flask(__name__)
analyzer = AnalyzerEngine()

# ── Custom Recognizers ────────────────────────────────────────────────────────

# 1. Aadhaar Number (India)
# Format: 12 digits, often spaced in 4-4-4
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="AADHAAR_NUMBER",
    patterns=[Pattern("AADHAAR", r"\b\d{4}\s?\d{4}\s?\d{4}\b", 0.85)]
))

# 2. PAN Number (India)
# Format: 5 letters, 4 digits, 1 letter
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="PAN_NUMBER",
    patterns=[Pattern("PAN", r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", 0.85)]
))

# 3. IFSC Code (India)
# Format: 4 letters, '0', 6 digits/letters
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IFSC_CODE",
    patterns=[Pattern("IFSC", r"\b[A-Z]{4}0[A-Z0-9]{6}\b", 0.85)]
))

# 4. Indian Phone Number
# Format: Optional +91 followed by 10 digits starting with 6-9
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_PHONE_NUMBER",
    patterns=[Pattern("PHONE", r"(?:\+91[\s-]?)?[6-9]\d{4}\s?\d{5}\b", 0.75)]
))

# 5. JWT Token
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="JWT_TOKEN",
    patterns=[Pattern("JWT", r"eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+", 0.9)]
))

# 6. Database connection strings
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="DB_CONNECTION_STRING",
    patterns=[Pattern("DB", r"(mongodb|mysql|postgresql|redis):\/\/[^\s\"']+", 0.9)]
))

# 7. Private IP
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="PRIVATE_IP",
    patterns=[Pattern("IP", r"\b(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\d+\.\d+\b", 0.85)]
))

# 8. Bank account number (Generic but common in India)
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="BANK_ACCOUNT",
    patterns=[Pattern("BANK_ACCT", r"\b\d{9,18}\b", 0.6)]
))

# ── Whitelist Configuration ──────────────────────────────────────────────────

# We only want these entities to show up in the dashboard.
# Irrelevant region-specific entities (like US_DRIVER_LICENSE) will be ignored.
ALLOWED_ENTITIES = [
    "AADHAAR_NUMBER",
    "PAN_NUMBER",
    "IFSC_CODE",
    "IN_PHONE_NUMBER",
    "BANK_ACCOUNT",
    "EMAIL_ADDRESS",
    "JWT_TOKEN",
    "DB_CONNECTION_STRING",
    "PRIVATE_IP",
    "LOCATION",
    "PERSON",
    "PHONE_NUMBER",
    "CREDIT_CARD",
    "CRYPTO",
    "IBAN_CODE"
]

# ── API endpoint ──────────────────────────────────────────────────────────────

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    language = data.get("language", "en")

    # Run the analyzer
    results = analyzer.analyze(text=text, language=language, entities=None)

    # Filter out blocked/irrelevant entities (like US specific ones)
    filtered_results = [
        r for r in results if r.entity_type in ALLOWED_ENTITIES
    ]

    return jsonify([
        {
            "entity_type": r.entity_type,
            "start": r.start,
            "end": r.end,
            "score": r.score
        }
        for r in filtered_results
    ])

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    print("-----------------------------------------")
    print("  Vantix Presidio (India-Focused) running on :5002")
    print("-----------------------------------------")
    app.run(host="0.0.0.0", port=5002, debug=False)

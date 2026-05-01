# 🛡️ ShieldX — AI Safety & Data Guard

ShieldX is a real-time Data Loss Prevention (DLP) ecosystem designed to protect sensitive information from leaking into third-party AI platforms.

## 🔴 The Problem
As AI tools like ChatGPT, Gemini, and Claude become essential for productivity, they also become a massive security risk. Employees and individuals frequently paste sensitive data—such as **API keys, Aadhaar numbers, corporate secrets, and personal PII**—into these external AI models. Once that data is sent, it is out of your control and potentially stored in the AI's training data.

## 🟢 The Purpose
**ShieldX** provides an "invisible" protective layer between the user and the AI. It acts as a real-time guardian that:
*   **Monitors** all input into AI platforms as you type.
*   **Identifies** sensitive patterns (PII, credentials, and custom company keywords).
*   **Prevents Leaks** by automatically masking data or blocking the "Send" button before the information ever leaves your browser.

## 🚀 Key Features

* **Real-time AI Platform Monitoring**: Silently runs on AI interfaces (ChatGPT, Claude, Gemini) scanning for violations on the fly.
* **Dual Modes of Operation**:
  * **Enterprise Mode**: Multi-tenant architecture for organizations. Configure custom domains, keywords, and rule bypasses via an Admin Dashboard. Features automated auto-masking for company secrets.
  * **Individual Mode**: Perfect for personal safety. Protects everyday users from accidentally pasting credit cards, SSNs, API keys, or personal emails into AI models. Includes a generous free tier (up to 50 scans).
* **Smart Auto-Masking**: Automatically replaces custom company keywords with inline asterisks (`***`), ensuring context is retained while protecting sensitive variables.
* **General PII Protection**: Built-in detection for standard sensitive data (Credit Cards, SSNs, API Keys, Emails, Phone Numbers).
* **Admin Dashboard Analytics (Enterprise)**: A modern, dark-mode React Dashboard featuring rich charts, timeline views, Top Offender lists, and platform usage metrics.
* **Active User Heartbeats**: Tracks active employee usage daily. Includes an automated chron job that emails administrators and users if they disable or abandon the protection extension.

## 📂 Project Structure

This repository contains the complete ShieldX ecosystem, divided into three main applications:

1. **`vantix-admin/` (Frontend Dashboard)**
   * A responsive, beautifully crafted Vite + React frontend dashboard.
   * Allows organization admins to track violations, manage rules, invite employees, and view rich data visualizations (Recharts).

2. **`vantix-backend/` (Node.js API)**
   * An Express & MongoDB backend handling authentication, rule delivery, and logging.
   * Multi-tenancy enabled via organizational scoping (`orgId`).
   * Includes automated cron jobs (`inactivityChecker.js`) using Nodemailer to alert inactive employees.

3. **`vantix-extension-v2/` (Chrome Extension)**
   * A Manifest V3 Chrome Extension.
   * Communicates seamlessly with the backend via `background.js` and uses a localized algorithm in `content.js`/`detector.js` to execute real-time regex matching and UI interceptions.

## 🤖 What's Detected

### Clipboard Guard (always-on)
| Type | Examples |
|---|---|
| PAN Card | ABCDE1234F |
| Aadhaar | 1234 5678 9012 or 1234-5678-9012 |
| Credit Card | 4111 1111 1111 1111 |
| API Keys | OpenAI `sk-...`, AWS `AKIA...`, GitHub `ghp_...`, Stripe `sk_live_...`, Google `AIza...`, OpenAI Project `sk-proj-...`, Slack `xoxb-...` |
| JWT Token | `eyJ...` |
| DB Connection String | `mongodb://`, `mysql://`, `postgresql://` |
| Private IP | 192.168.x.x, 10.x.x.x, 172.16-31.x.x |
| IFSC Code | HDFC0001234 |
| Bank Account | 9–18 digit numbers |
| ENV Secrets | `API_KEY=abc123`, `export SECRET=xyz` |
| Email (standard) | user@gmail.com |
| Email (obfuscated) | user (at) gmail (dot) com |
| Phone (Indian) | +91 9876543210, 9876543210 |

## 🚦 Getting Started

### 1. Setup the Backend
```bash
cd vantix-backend
npm install
npm run dev
```

### 2. Setup the Admin Dashboard
```bash
cd vantix-admin
npm install
npm run dev
```

### 3. Setup the Desktop Agent (Python)
```bash
cd vantix-agent
python -m pip install pyperclip requests win10toast pynput pygetwindow phonenumbers
python agent.py
```

### 4. Load the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"** and select the `vantix-extension-v2` folder.

---
*Developed for robust data compliance and enterprise AI safety.*

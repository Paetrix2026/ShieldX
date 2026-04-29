# 🛡️ ShieldX Installation & Setup Guide

This document logs the dependencies installed and the commands required to set up and run the complete ShieldX ecosystem.

## 📋 Installation Summary

The following dependencies have been installed across the project sub-directories:

### 1. Vantix Backend (Node.js)
- **Path**: `vantix-backend/`
- **Action**: `npm install`
- **Key Dependencies**: Express, Mongoose, Axios, JWT, Nodemailer, PDFKit.

### 2. Vantix Admin Dashboard (React/Vite)
- **Path**: `vantix-admin/`
- **Action**: `npm install`
- **Key Dependencies**: React, Vite, Framer Motion, Recharts, Lucide React.

### 3. Vantix Clipboard Agent (Python)
- **Path**: `vantix-agent/`
- **Action**: `python -m pip install pyperclip requests win10toast`
- **Purpose**: Real-time clipboard monitoring for sensitive data.

### 4. Custom Presidio Service (Python)
- **Path**: Root directory (`presidio_custom.py`)
- **Action**: `python -m pip install flask presidio-analyzer`
- **Purpose**: Custom PII detection logic for India-specific patterns (PAN, Aadhaar, etc.).

---

## 🚀 Required Run Commands

To get the full system running, you need to start the following components in separate terminal windows:

### 1. Backend Server
```bash
cd vantix-backend
npm run dev
```
*Make sure to configure your `.env` file first.*

### 2. Admin Dashboard
```bash
cd vantix-admin
npm run dev
```
*Access the dashboard at `http://localhost:5173` (or the port shown in terminal).*

### 3. Clipboard Agent
```bash
cd vantix-agent
python agent.py
```
*This will start the background monitoring agent.*

### 4. Custom Presidio Service
```bash
python presidio_custom.py
```
*Starts a Flask service on port 5002 for custom pattern recognition.*

---

## 🧩 Chrome Extension
1. Go to `chrome://extensions/`
2. Enable **Developer Mode**.
3. Click **Load unpacked**.
4. Select the `vantix-extension-v2` folder.

---
*Setup completed by Antigravity AI Assistant.*

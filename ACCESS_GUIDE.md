# ShieldX Access Management Guide

This file explains how to grant or revoke access to your project using the **Remote Integrity Guard** system.

### 1. The Master Control (GitHub Gist)
Access is controlled by your public Gist:
**URL**: `https://gist.github.com/Jeevan-AG/2c664f4dd4421ded8497bf5625ce5027`

Each line in this Gist represents an authorized **License Key**.

---

### 2. How to Add a Friend (Grant Access)
If you want to let someone else use your cloned project:

1.  **Generate a Key**: Create a unique string for them (e.g., `SHIELD-FRIEND-2026`).
2.  **Tell your Friend**: Ask them to add the following line to their `.env` file (in both `vantix-backend` and `vantix-admin`):
    *   Backend `.env`: `PROJECT_LICENSE=SHIELD-FRIEND-2026`
    *   Frontend `.env`: `VITE_PROJECT_LICENSE=SHIELD-FRIEND-2026`
3.  **Authorize the Key**: Go to your GitHub Gist and add `SHIELD-FRIEND-2026` as a **new line**.
4.  **Activation**: Their project will now start working immediately.

---

### 3. How to Revoke Access (Block Someone)
If you want to stop someone from using the project:

1.  Go to your GitHub Gist.
2.  **Delete the line** containing their License Key.
3.  **Result**: Their backend will crash on the next restart, and their frontend will show the "PROJECT TERMINATED" screen.

---

### 4. Global Kill Switch
To block **everyone** (including yourself) from using the code:
*   Delete the Gist entirely or change all lines to something else.

---

**Note**: This guide is ignored by Git, so it will only exist on your local machine.

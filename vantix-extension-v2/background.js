chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // ── Fetch rules — returns { companyRules, generalRules } ──────────────────
  if (message.type === "FETCH_RULES") {
    fetch("http://localhost:5000/api/rules", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: message.token ? `Bearer ${message.token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Backend now returns { companyRules, generalRules }
        // Fall back gracefully if old shape arrives
        const companyRules = data.companyRules || data.data || data || {};
        const generalRules = data.generalRules || {};
        sendResponse({ success: true, companyRules, generalRules });
      })
      .catch((err) => {
        console.error("[Vantix BG] Fetch rules error:", err);
        sendResponse({ success: false });
      });

    return true; // keep channel open for async response
  }

  // ── Audit logging ─────────────────────────────────────────────────────────
  if (message.type === "LOG_AUDIT") {
    fetch("http://localhost:5000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    })
    .catch(async () => {
      const data = await chrome.storage.local.get(["vantixOfflineAuditLogs"]);
      const logs = data.vantixOfflineAuditLogs || [];
      logs.push(message.payload);
      await chrome.storage.local.set({ vantixOfflineAuditLogs: logs });
    });
  }

  // ── Log violation ─────────────────────────────────────────────────────────
  if (message.type === "LOG_VIOLATION") {
    fetch("http://localhost:5000/api/violations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: message.token ? `Bearer ${message.token}` : "",
      },
      body: JSON.stringify(message.payload),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => {
        console.error("[Vantix BG] Log violation error:", err);
        sendResponse({ success: false });
      });

    return true;
  }

  // ── Heartbeat Ping ────────────────────────────────────────────────────────
  if (message.type === "PING_HEARTBEAT") {
    const platform = message.platform || "Unknown";
    const storageKey = `vantixLastHeartbeat_${platform}`;
    
    chrome.storage.local.get([storageKey], (res) => {
      const now = Date.now();
      const last = res[storageKey] || 0;
      // Send every 5 minutes per platform to maintain "Online" status
      if (now - last > 5 * 60 * 1000) {
        fetch("http://localhost:5000/api/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: message.token ? `Bearer ${message.token}` : "",
          },
          body: JSON.stringify({ platform }),
        })
          .then((res) => res.json())
          .then((data) => {
            // Store the access status returned by the server
            chrome.storage.local.set({ 
              [storageKey]: now,
              vantixAccessStatus: data.accessStatus || "granted"
            });
            sendResponse({ success: true, accessStatus: data.accessStatus });
          })
          .catch((err) => {
            console.error("[Vantix BG] Heartbeat error:", err);
            sendResponse({ success: false });
          });
      } else {
        sendResponse({ success: true, cached: true });
      }
    });
    return true;
  }
});

// ── Externally Connectable (Sync from Dashboard) ─────────────────────────────
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log("[Vantix BG] External message received:", message);
  if (message.type === "SYNC_AUTH") {
    console.log("[Vantix BG] Syncing auth and fetching profile...");
    
    // Fetch profile to get userType, orgId, etc.
    fetch("http://localhost:5000/api/auth/profile", {
      headers: { "Authorization": `Bearer ${message.token}` }
    })
    .then(res => res.json())
    .then(data => {
      const user = data.user || {};
      chrome.storage.local.set({
        vantixToken: message.token,
        vantixEmail: message.email,
        vantixUserType: message.userType || (user.role === "admin" ? "company" : (user.userType || "company")),
        vantixOrgId: user.organizationId || user.orgId || ""
      }, () => {
        console.log("[Vantix BG] Auth and profile synced successfully");
        sendResponse({ success: true });
      });
    })
    .catch(err => {
      console.error("[Vantix BG] Profile fetch failed, syncing token only:", err);
      chrome.storage.local.set({
        vantixToken: message.token,
        vantixEmail: message.email
      }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});
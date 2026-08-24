import React, { useState } from "react";
import { useLocation } from "react-router-dom";

function routeMeta(pathname) {
  if (pathname === "/") {
    return {
      title: "Security Overview",
      subtitle: "Live posture and recent data-leak prevention activity.",
    };
  }
  if (pathname === "/employees") {
    return {
      title: "Employee Directory",
      subtitle: "Provision users and monitor onboarding status.",
    };
  }
  if (pathname === "/rules") {
    return {
      title: "Detection Rules",
      subtitle: "Configure protected domains and sensitive keywords.",
    };
  }
  if (pathname === "/violations") {
    return {
      title: "Violation Audit Log",
      subtitle: "Detailed history of all blocked data leakage attempts.",
    };
  }
  if (pathname === "/reports") {
    return {
      title: "Reports",
      subtitle: "Generate and export weekly, monthly, or yearly activity reports.",
    };
  }
  if (pathname === "/settings") {
    return {
      title: "Settings",
      subtitle: "Manage organization, security, and preferences.",
    };
  }
  return { title: "Vantix Admin", subtitle: "Secure-by-default operations." };
}

export default function Topbar({ title, subtitle }) {
  const { pathname } = useLocation();
  const meta = routeMeta(pathname);
  const finalTitle = title || meta.title;
  const finalSubtitle = subtitle || meta.subtitle;

  const [isDark, setIsDark] = useState(
    () => (localStorage.getItem("theme") || "light") === "dark"
  );

  return (
    <header className="topbar">
      <div className="topbar__row">
        <div className="topbar__title">
          <h1>{finalTitle}</h1>
          <p>{finalSubtitle}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Status indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--panel)",
            border: "1px solid var(--border-color)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}>
            <div className="pulse-dot" />
            <span>System Active</span>
          </div>

          {/* Theme toggle */}
          <div
            className="theme-toggle"
            onClick={() => {
              window.toggleTheme();
              setIsDark(!isDark);
            }}
            title="Toggle theme"
          >
            <div className="toggle-track">
              <div className="toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

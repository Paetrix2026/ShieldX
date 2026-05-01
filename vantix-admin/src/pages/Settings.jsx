import React, { useState, useEffect } from "react";
import api from "../utils/api";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  // Org info
  const [orgInfo, setOrgInfo] = useState({ email: "", employeeCount: 0, createdAt: "" });
  const [isProjectActive, setIsProjectActive] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Decode admin email from token
        const token = sessionStorage.getItem("vantixAdminToken");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setOrgInfo((prev) => ({ ...prev, email: payload.email || "" }));
        }

        const usersRes = await api.get("/users");
        if (usersRes.data.success) {
          setOrgInfo((prev) => ({
            ...prev,
            employeeCount: usersRes.data.users.length,
          }));
        }

        const statusRes = await api.get("/auth/project-status");
        if (statusRes.data.success) {
          setIsProjectActive(statusRes.data.isActive);
        }
      } catch (err) {
        console.error("Settings error:", err);
      }
    };
    fetchSettings();
  }, []);

  const toggleProjectStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${isProjectActive ? 'TERMINATE' : 'RESTORE'} project access? This will affect all local copies connecting to this database.`)) {
      return;
    }

    try {
      setBusy(true);
      const res = await api.post("/auth/toggle-project-status");
      if (res.data.success) {
        setIsProjectActive(res.data.isActive);
        alert(`Project ${res.data.isActive ? 'Activated' : 'Terminated'} Successfully.`);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to toggle project status");
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }

    try {
      setBusy(true);
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setPwSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPwError(err.response?.data?.error || "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      {/* Organization Info */}
      <section className="card">
        <div className="card__head">
          <p className="card__title">Organization</p>
        </div>
        <div className="card__body">
          <div className="grid grid--3" style={{ gap: 20 }}>
            <div className="metric">
              <div>
                <div
                  className="value"
                  style={{ fontSize: 16, wordBreak: "break-all" }}
                >
                  {orgInfo.email || "—"}
                </div>
                <div className="hint">Admin email</div>
              </div>
            </div>
            <div className="metric">
              <div>
                <div className="value">{orgInfo.employeeCount}</div>
                <div className="hint">Employees registered</div>
              </div>
            </div>
            <div className="metric">
              <div>
                <div className="value" style={{ fontSize: 16 }}>
                  v2.0.0
                </div>
                <div className="hint">Vantix version</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="card">
        <div className="card__head">
          <p className="card__title">Change password</p>
        </div>
        <div className="card__body" style={{ maxWidth: 460 }}>
          {pwError && (
            <div className="toast toast--err" style={{ marginBottom: 12 }}>
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="toast toast--ok" style={{ marginBottom: 12 }}>
              {pwSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="grid" style={{ gap: 12 }}>
            <div className="field">
              <div className="label">Current password</div>
              <input
                className="input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="field">
              <div className="label">New password</div>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <div className="label">Confirm new password</div>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              className="btn btn--primary"
              type="submit"
              disabled={busy}
              style={{ marginTop: 4, width: "fit-content" }}
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </section>

      {/* Quick Info */}
      <section className="card">
        <div className="card__head">
          <p className="card__title">Extension support</p>
        </div>
        <div className="card__body">
          <p style={{ color: "var(--muted-text)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            Vantix currently monitors the following AI platforms:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              ChatGPT, Gemini, Claude, Copilot, Perplexity, DeepSeek, Grok, Meta AI, HuggingChat, and Mistral
            </strong>
            . The extension automatically detects sensitive data typed into these platforms and enforces your organization's rules.
          </p>
        </div>
      </section>

      {/* Danger Zone: Remote Project Kill Switch */}
      <section className="card" style={{ border: "1px solid rgba(255, 61, 0, 0.3)", background: "rgba(255, 61, 0, 0.02)" }}>
        <div className="card__head">
          <p className="card__title" style={{ color: "#FF3D00" }}>Danger Zone</p>
        </div>
        <div className="card__body">
          <p style={{ fontSize: 13, color: "var(--muted-text)", marginBottom: 16, lineHeight: 1.6 }}>
            If you believe the project is being used without authorization (e.g., someone has a local copy they shouldn't have), you can remotely terminate access. This will block all backend requests until re-activated.
          </p>
          <button 
            className={`btn ${isProjectActive ? 'btn--danger' : 'btn--primary'}`}
            onClick={toggleProjectStatus}
            disabled={busy}
            style={{ 
              background: isProjectActive ? "#FF3D00" : "linear-gradient(90deg, #00FFC2, #00E5FF)",
              border: "none",
              color: isProjectActive ? "#fff" : "#051226"
            }}
          >
            {isProjectActive ? "🔒 Terminate Project Access" : "🔓 Restore Project Access"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;

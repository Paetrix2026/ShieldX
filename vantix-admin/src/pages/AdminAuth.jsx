import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/vantix-logo.svg";

import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "firebase/auth";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);

      const res = await signInWithEmailAndPassword(auth, email, password);
      const token = await res.user.getIdToken();

      sessionStorage.setItem("vantixAdminToken", token);
      navigate("/");

    } catch (err) {
      setError(err.code);
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();
      
      // Sync with extension if present
      const EXTENSION_ID = "fhohiejeobmkadffkmblpnnakcfkhadh";
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
        window.chrome.runtime.sendMessage(EXTENSION_ID, { 
          type: "SYNC_AUTH", 
          token, 
          email: result.user.email 
        }, () => {
          if (window.chrome.runtime.lastError) { /* Silent */ }
        });
      }

      sessionStorage.setItem("vantixAdminToken", token);

      navigate("/");
    } catch (err) {
      setError(err.code);
    }
  };

  const githubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();
      
      // Sync with extension if present
      const EXTENSION_ID = "fhohiejeobmkadffkmblpnnakcfkhadh";
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
        window.chrome.runtime.sendMessage(EXTENSION_ID, { 
          type: "SYNC_AUTH", 
          token, 
          email: result.user.email 
        }, () => {
          if (window.chrome.runtime.lastError) { /* Silent */ }
        });
      }

      sessionStorage.setItem("vantixAdminToken", token);

      navigate("/");
    } catch (err) {
      setError(err.code);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">

        {/* LEFT PANEL */}
        <section className="auth__left">
          <div className="auth__logo">
            <img src={logo} alt="Vantix" />
            <div>
              <strong>Vantix</strong>
              <span>Defend before you send</span>
            </div>
          </div>

          <h2 className="auth__headline">
            Company-grade data leak prevention dashboard
          </h2>

          <p className="auth__copy">
            Monitor violations, manage employee access, and tune detection rules — all with a security-first UX.
          </p>
        </section>

        {/* RIGHT PANEL */}
        <section className="auth__right">

          <div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Sign in
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              Admin access
            </div>
          </div>

          {error && (
            <div className="toast toast--err" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid" style={{ marginTop: 12 }}>

            <input
              className="input"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="btn btn--primary"
              disabled={busy}
            >
              {busy ? "Signing in..." : "Continue"}
            </button>

          </form>

          {/* ── OR SEPARATOR ── */}
          <div style={{ display: "flex", alignItems: "center", margin: "20px 0", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.05)" }}></div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.05)" }}></div>
          </div>

          {/* ── SOCIAL LOGIN BUTTONS ── */}
          <div className="grid" style={{ gap: "10px" }}>
            <button
              type="button"
              onClick={googleLogin}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e1e4e8",
                background: "#fff",
                color: "#24292e",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#f6f8fa"}
              onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={githubLogin}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #24292e",
                background: "#24292e",
                color: "#fff",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div style={{ marginTop: 20, fontSize: 13, textAlign: "center" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#25E6D9", fontWeight: "600", textDecoration: "none" }}>
              Create an organization →
            </Link>
          </div>

        </section>
      </div>
    </div>
  );
};

export default AdminAuth;
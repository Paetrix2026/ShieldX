import React, { useState, useEffect } from "react";
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
  const [loginType, setLoginType] = useState("company"); // "company" or "individual"
  const [companyRole, setCompanyRole] = useState("employee"); // "employee" or "admin"
  
  // Track theme to force re-render if needed, though CSS vars handle most of it.
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("theme-dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("theme-dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
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
      
      const EXTENSION_ID = "fhohiejeobmkadffkmblpnnakcfkhadh";
      if (window.chrome?.runtime?.sendMessage) {
        window.chrome.runtime.sendMessage(EXTENSION_ID, { 
          type: "SYNC_AUTH", 
          token, 
          email: result.user.email 
        }, () => {});
      }
      sessionStorage.setItem("vantixAdminToken", token);
      navigate("/");
    } catch (err) { setError(err.code); }
  };

  const githubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      const EXTENSION_ID = "fhohiejeobmkadffkmadffkmblpnnakcfkhadh";
      if (window.chrome?.runtime?.sendMessage) {
        window.chrome.runtime.sendMessage(EXTENSION_ID, { 
          type: "SYNC_AUTH", 
          token, 
          email: result.user.email 
        }, () => {});
      }
      sessionStorage.setItem("vantixAdminToken", token);
      navigate("/");
    } catch (err) { setError(err.code); }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--bg-primary)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
      transition: "background 0.3s ease"
    }}>
      
      {/* Glow effects matching the photo's white shadows */}
      <div style={{
        position: "absolute",
        top: "10%",
        right: "20%",
        width: "600px",
        height: "600px",
        background: isDark ? "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)" : "radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>
      
      {/* Giant Background Text */}
      <div style={{
        position: "absolute",
        top: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "180px",
        fontWeight: "900",
        color: "transparent",
        WebkitTextStroke: isDark ? "1px rgba(255,255,255,0.08)" : "1px rgba(0,0,0,0.05)",
        letterSpacing: "-5px",
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none"
      }}>
        VANTIX
      </div>

      {/* Main Content Container */}
      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        
        {/* Header */}
        <h1 style={{ 
          fontSize: "42px", 
          fontWeight: "800", 
          textTransform: "uppercase", 
          margin: "0 0 16px 0",
          textAlign: "center",
          letterSpacing: "-1px"
        }}>
          <span style={{ 
            background: "linear-gradient(90deg, #00FFC2, #00E5FF)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent" 
          }}>
            VANTIX
          </span>
          <span style={{ color: "var(--text-primary)", marginLeft: "12px", transition: "color 0.3s ease" }}>
            SECURITY
          </span>
        </h1>
        
        {/* Subtitle */}
        <p style={{ 
          color: "var(--text-secondary)", 
          fontSize: "16px", 
          marginBottom: "40px",
          textAlign: "center",
          fontWeight: "400",
          transition: "color 0.3s ease"
        }}>
          Securely Access The Vantix Ecosystem
        </p>

        {/* The Card */}
        <div style={{
          width: "440px",
          background: "var(--bg-secondary)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 20px 40px rgba(0,0,0,0.1)",
          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
        }}>
          
          {/* HEADER TOOLS (Theme Toggle & Back) */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "center" }}>
            <button style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", padding: 0 }}>← Back</button>
            <div className="theme-toggle" onClick={() => window.toggleTheme && window.toggleTheme()}>
              <div className="toggle-track" style={{ border: "1px solid var(--border-color)" }}>
                <div className="toggle-thumb"></div>
              </div>
            </div>
          </div>

          {/* Primary Tabs: Company / Individual */}
          <div style={{ display: "flex", gap: "10px", marginBottom: loginType === "company" ? "16px" : "32px" }}>
            <div 
              onClick={() => setLoginType("company")}
              style={{ 
                flex: 1, 
                textAlign: "center", 
                padding: "10px 0", 
                border: loginType === "company" ? "1px solid #00E5FF" : "1px solid transparent", 
                borderRadius: "24px", 
                color: loginType === "company" ? "#00E5FF" : "var(--text-secondary)",
                background: loginType === "company" ? "rgba(0, 229, 255, 0.05)" : "transparent",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Company
            </div>
            <div 
              onClick={() => setLoginType("individual")}
              style={{ 
                flex: 1, 
                textAlign: "center", 
                padding: "10px 0", 
                border: loginType === "individual" ? "1px solid #00E5FF" : "1px solid transparent", 
                borderRadius: "24px", 
                color: loginType === "individual" ? "#00E5FF" : "var(--text-secondary)",
                background: loginType === "individual" ? "rgba(0, 229, 255, 0.05)" : "transparent",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Individual
            </div>
          </div>

          {/* Secondary Tabs: Admin / Employee (Only show if Company is selected) */}
          {loginType === "company" && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px", padding: "4px", background: "var(--panel)", borderRadius: "24px" }}>
              <div 
                onClick={() => setCompanyRole("employee")}
                style={{ 
                  flex: 1, 
                  textAlign: "center", 
                  padding: "6px 0", 
                  borderRadius: "20px", 
                  background: companyRole === "employee" ? "var(--bg-primary)" : "transparent",
                  color: companyRole === "employee" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: companyRole === "employee" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Employee
              </div>
              <div 
                onClick={() => setCompanyRole("admin")}
                style={{ 
                  flex: 1, 
                  textAlign: "center", 
                  padding: "6px 0", 
                  borderRadius: "20px", 
                  background: companyRole === "admin" ? "var(--bg-primary)" : "transparent",
                  color: companyRole === "admin" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: companyRole === "admin" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Admin
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  type="email" 
                  placeholder="Enter your email here" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    width: "100%", 
                    height: "48px", 
                    background: "var(--bg-primary)", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "24px", 
                    padding: "0 16px 0 44px", 
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#00E5FF"; e.target.style.boxShadow = "0 0 0 3px rgba(0,229,255,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                  required 
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    width: "100%", 
                    height: "48px", 
                    background: "var(--bg-primary)", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "24px", 
                    padding: "0 44px 0 44px", 
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    letterSpacing: "2px",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#00E5FF"; e.target.style.boxShadow = "0 0 0 3px rgba(0,229,255,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                  required 
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </div>
            </div>

            <div style={{ textAlign: "right", marginBottom: "24px" }}>
              <a href="#" style={{ color: "#00E5FF", fontSize: "12px", textDecoration: "none" }}>Forgot Password?</a>
            </div>

            {error && <p style={{ color: "#FF4D6D", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>{error}</p>}

            {/* Login Button */}
            <button type="submit" disabled={busy} style={{ 
              width: "100%", 
              height: "48px", 
              background: "linear-gradient(90deg, #00FFC2, #00E5FF)", 
              color: "#051226", 
              border: "none", 
              borderRadius: "24px", 
              fontSize: "14px", 
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0, 229, 255, 0.3)",
              marginBottom: "20px",
              transition: "transform 0.2s"
            }}>
              {busy ? "Logging in..." : `Login as ${loginType === 'company' ? (companyRole === 'admin' ? 'Admin' : 'Employee') : 'Individual'}`}
            </button>
            
            {/* Social Logins */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button type="button" onClick={googleLogin} style={{
                flex: 1,
                background: "transparent",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
                padding: "10px",
                borderRadius: "24px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button type="button" onClick={githubLogin} style={{
                flex: 1,
                background: "transparent",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
                padding: "10px",
                borderRadius: "24px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </button>
            </div>

          </form>
        </div>

        {/* Footer text */}
        <p style={{ marginTop: "40px", fontSize: "12px", color: "var(--text-secondary)" }}>
          Copyright © 2025 Team ShieldX. All Rights Reserved.
        </p>

      </div>
    </div>
  );
};

export default AdminAuth;
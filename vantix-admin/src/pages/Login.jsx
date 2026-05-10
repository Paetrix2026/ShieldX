import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Shield, Lock, Mail, Globe, CheckCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        sessionStorage.setItem("vantixAdminToken", res.data.token);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Access Denied: Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock handlers for social logins (would integrate with Firebase/Auth0 in production)
  const handleSocialLogin = (provider) => {
    alert(`${provider} login would be triggered here.`);
  };

  return (
    <div className="login-page" style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Tactical Background Elements */}
      <div className="login-bg-grid" style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "radial-gradient(circle at 2px 2px, rgba(37, 230, 217, 0.05) 1px, transparent 0)",
        backgroundSize: "40px 40px",
        zIndex: 1
      }} />
      
      <div style={{
        position: "absolute",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(37, 230, 217, 0.03) 0%, transparent 70%)",
        top: "10%",
        right: "-10%",
        zIndex: 1,
        borderRadius: "50%"
      }} />

      <div className="login-container" style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "420px",
        padding: "20px"
      }}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center",
            width: "64px",
            height: "64px",
            background: "rgba(37, 230, 217, 0.1)",
            borderRadius: "16px",
            marginBottom: "16px",
            border: "1px solid rgba(37, 230, 217, 0.2)"
          }}>
            <Shield size={32} color="var(--brand)" />
          </div>
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "800", 
            letterSpacing: "4px", 
            color: "var(--text-primary)",
            margin: 0
          }}>VANTIX</h1>
          <p style={{ 
            fontSize: "12px", 
            color: "var(--brand)", 
            textTransform: "uppercase", 
            letterSpacing: "2px",
            marginTop: "4px",
            fontWeight: "600"
          }}>Sentinel Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ 
          padding: "40px", 
          backdropFilter: "blur(24px)",
          background: "var(--bg-glass)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ fontSize: "18px", marginBottom: "24px", textAlign: "center", color: "var(--text-primary)" }}>
            System Authentication
          </h2>

          {error && (
            <div className="toast toast--err" style={{ marginBottom: "20px", fontSize: "13px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="field">
              <label className="label" style={{ color: "var(--muted-2)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Admin Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
                <input
                  className="input"
                  type="email"
                  placeholder="admin@vantix.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label" style={{ color: "var(--muted-2)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Access Key</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <a href="#" style={{ color: "var(--brand)", fontSize: "12px", textDecoration: "none", opacity: 0.8 }}>Forgot Access Key?</a>
            </div>

            <button 
              className="btn btn--primary" 
              type="submit" 
              disabled={isLoading}
              style={{ height: "48px", fontSize: "15px", fontWeight: "700", marginTop: "8px" }}
            >
              {isLoading ? "AUTHENTICATING..." : "SECURE LOGIN"}
            </button>
          </form>

          {/* SSO Section */}
          <div style={{ margin: "32px 0 24px", position: "relative", textAlign: "center" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "var(--border-color)", zIndex: 1 }} />
            <span style={{ position: "relative", background: "var(--bg-primary)", padding: "0 12px", fontSize: "12px", color: "var(--muted-2)", zIndex: 2 }}>
              OR CONTINUE WITH
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button 
              type="button" 
              className="btn btn--ghost" 
              onClick={() => handleSocialLogin("Google")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "42px" }}
            >
              <Globe size={18} />
              Google
            </button>
            <button 
              type="button" 
              className="btn btn--ghost" 
              onClick={() => handleSocialLogin("GitHub")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "42px" }}
            >
              <Globe size={18} />
              GitHub
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: "32px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <div className="pulse-dot" style={{ width: "8px", height: "8px" }} />
          <span style={{ fontSize: "12px", color: "var(--muted-2)", letterSpacing: "0.5px" }}>
            Vantix Security Node v2.0.4 — <span style={{ color: "var(--brand)" }}>Operational</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
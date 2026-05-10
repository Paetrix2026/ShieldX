import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { Shield, Mail, Lock, Globe, ChevronLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginType, setLoginType] = useState("company"); // "company" or "individual"
  const [companyRole, setCompanyRole] = useState("employee"); // "employee" or "admin"
  const [showPassword, setShowPassword] = useState(false);
  
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("theme-dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("theme-dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const navigate = useNavigate();

  const syncWithExtension = (token, email) => {
    const EXTENSION_ID = "fhohiejeobmkadffkmblpnnakcfkhadh";
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
      window.chrome.runtime.sendMessage(EXTENSION_ID, { 
        type: "SYNC_AUTH", 
        token, 
        email 
      }, () => {
        if (window.chrome.runtime.lastError) {
          console.warn("[Vantix Admin] Extension sync failed. Ensure extension is installed and ID is correct.");
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setBusy(true);
      setError("");

      const res = await api.post("/auth/admin-login", { email, password });
      
      if (res.data.success && res.data.token) {
        const token = res.data.token;
        syncWithExtension(token, email);
        sessionStorage.setItem("vantixAdminToken", token);
        navigate("/");
      } else {
        setError(res.data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Connection failed. Ensure backend is running.");
    } finally {
      setBusy(false);
    }
  };

  const socialLoginStub = (provider) => {
    setError(`Social login with ${provider} is being provisioned.`);
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--bg-primary)",
      position: "relative",
      overflow: "hidden",
      padding: "20px"
    }}>
      
      {/* Background Ambience */}
      <div className="login-bg-grid" style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "radial-gradient(circle at 2px 2px, rgba(37, 230, 217, 0.05) 1px, transparent 0)",
        backgroundSize: "40px 40px",
        zIndex: 0
      }} />

      <div style={{
        position: "absolute",
        top: "10%",
        right: "20%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(37, 230, 217, 0.03) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      
      {/* Dynamic Background Text */}
      <div style={{
        position: "absolute",
        top: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "min(22vw, 240px)",
        fontWeight: "900",
        fontFamily: "var(--mono)",
        color: "transparent",
        WebkitTextStroke: "1px rgba(34, 211, 238, 0.05)",
        letterSpacing: "-10px",
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        whiteSpace: "nowrap",
        opacity: 0.6
      }}>
        OBSIDIAN_OPS
      </div>

      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "460px" }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center",
            width: "80px",
            height: "80px",
            background: "rgba(34, 211, 238, 0.05)",
            borderRadius: "24px",
            marginBottom: "24px",
            border: "1px solid rgba(34, 211, 238, 0.15)",
            boxShadow: "0 0 30px rgba(34, 211, 238, 0.05)"
          }}>
            <Shield size={40} color="var(--brand)" />
          </div>
          <h1 style={{ 
            fontSize: "42px", 
            fontWeight: "800", 
            fontFamily: "var(--mono)",
            textTransform: "uppercase", 
            margin: 0,
            letterSpacing: "-2px"
          }}>
            <span style={{ color: "var(--brand)", textShadow: "0 0 20px rgba(34, 211, 238, 0.4)" }}>VANTIX</span>
            <span style={{ color: "var(--text-primary)", marginLeft: "12px" }}>_NODE</span>
          </h1>
          <p style={{ color: "var(--muted-2)", fontSize: "13px", marginTop: "12px", fontFamily: "var(--mono)", letterSpacing: "1px" }}>
            ESTABLISHING SECURE PERIMETER [AUTH_LEVEL_0]
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="card" style={{
          width: "100%",
          background: "var(--bg-glass)",
          backdropFilter: "blur(32px)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)"
        }}>
          
          {/* Top Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", alignItems: "center" }}>
            <button 
              onClick={() => navigate(-1)}
              style={{ background: "none", border: "none", color: "var(--brand)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="pulse-dot" style={{ width: 8, height: 8 }} />
              <span style={{ fontSize: '11px', color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Active Node</span>
            </div>
          </div>

          {/* Login Type Selector (Pills) */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "12px" }}>
            {["company", "individual"].map(type => (
              <button 
                key={type}
                onClick={() => setLoginType(type)}
                style={{ 
                  flex: 1, 
                  textAlign: "center", 
                  padding: "10px 0", 
                  border: "none",
                  borderRadius: "8px", 
                  color: loginType === type ? "var(--bg-primary)" : "var(--muted-2)",
                  background: loginType === type ? "var(--brand)" : "transparent",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "capitalize"
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sub-Role Selector (Only for Company) */}
          {loginType === "company" && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
              {["employee", "admin"].map(role => (
                <button 
                  key={role}
                  onClick={() => setCompanyRole(role)}
                  style={{ 
                    flex: 1, 
                    textAlign: "center", 
                    padding: "8px 0", 
                    background: "none",
                    border: "none",
                    borderBottom: companyRole === role ? "2px solid var(--brand)" : "2px solid transparent",
                    color: companyRole === role ? "var(--text-primary)" : "var(--muted-2)",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="field">
              <label className="label" style={{ color: "var(--muted-2)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Email Identifier</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
                <input 
                  type="email" 
                  placeholder="name@organization.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: "42px" }}
                  required 
                />
              </div>
            </div>

            <div className="field">
              <label className="label" style={{ color: "var(--muted-2)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Access Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: "42px", paddingRight: "42px" }}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted-2)", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <a href="#" style={{ color: "var(--brand)", fontSize: "12px", textDecoration: "none", opacity: 0.8 }}>Recovery Protocol?</a>
            </div>

            {error && <div className="toast toast--err" style={{ fontSize: "13px" }}>{error}</div>}

            <button type="submit" disabled={busy} className="btn btn--primary" style={{ height: "48px", fontWeight: "700", marginTop: "8px" }}>
              {busy ? "ESTABLISHING CONNECTION..." : `LOGIN AS ${companyRole.toUpperCase()}`}
            </button>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
              <button type="button" onClick={() => socialLoginStub("Google")} className="btn btn--ghost" style={{ fontSize: "12px", height: "42px" }}>
                <Globe size={16} style={{ marginRight: "8px" }} /> Google
              </button>
              <button type="button" onClick={() => socialLoginStub("GitHub")} className="btn btn--ghost" style={{ fontSize: "12px", height: "42px" }}>
                <Globe size={16} style={{ marginRight: "8px" }} /> GitHub
              </button>
            </div>

            <div style={{ fontSize: "13px", textAlign: "center", marginTop: "16px", color: "var(--muted-2)" }}>
              No security perimeter defined?{" "}
              <Link to="/register" style={{ color: "var(--brand)", fontWeight: "700", textDecoration: "none" }}>
                Register Organization →
              </Link>
            </div>
          </form>
        </div>

        {/* Legal/Footer */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "var(--muted-2)", letterSpacing: "1px", textTransform: "uppercase" }}>
            Protected by Vantix Encryption Node &middot; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
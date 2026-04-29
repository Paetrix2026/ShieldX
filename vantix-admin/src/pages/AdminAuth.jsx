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

          {/* 🔥 SOCIAL LOGIN BUTTONS */}
          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              onClick={googleLogin}
              style={{
                width: "100%",
                marginBottom: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#fff",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Continue with Google
            </button>

            <button
              type="button"
              onClick={githubLogin}
              style={{
                width: "100%",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#fff",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Continue with GitHub
            </button>
          </div>

          <div style={{ marginTop: 14, fontSize: 12 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#25E6D9" }}>
              Create an organization →
            </Link>
          </div>

        </section>
      </div>
    </div>
  );
};

export default AdminAuth;
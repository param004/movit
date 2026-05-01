import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";

/* Shared truck SVG illustration */
const TruckIllustration = () => (
  <svg width="220" height="168" viewBox="0 0 220 168" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    style={{ position: "relative", zIndex: 1 }}>
    <rect x="8" y="130" width="204" height="28" rx="8" fill="rgba(255,255,255,.1)" />
    <rect x="90" y="141" width="18" height="6" rx="3" fill="rgba(255,255,255,.3)" />
    <rect x="116" y="141" width="18" height="6" rx="3" fill="rgba(255,255,255,.3)" />
    <rect x="22" y="87" width="106" height="52" rx="7" fill="rgba(255,255,255,.22)" />
    <rect x="126" y="103" width="50" height="36" rx="7" fill="rgba(255,255,255,.28)" />
    <rect x="133" y="107" width="34" height="17" rx="5" fill="rgba(147,197,253,.55)" />
    <circle cx="52" cy="142" r="11" fill="#1e3a8a" stroke="white" strokeWidth="3" />
    <circle cx="52" cy="142" r="4.5" fill="rgba(255,255,255,.4)" />
    <circle cx="146" cy="142" r="11" fill="#1e3a8a" stroke="white" strokeWidth="3" />
    <circle cx="146" cy="142" r="4.5" fill="rgba(255,255,255,.4)" />
    <rect x="32" y="95" width="28" height="26" rx="4" fill="rgba(255,255,255,.45)" />
    <line x1="46" y1="95" x2="46" y2="121" stroke="rgba(30,58,138,.3)" strokeWidth="1.5" />
    <line x1="32" y1="108" x2="60" y2="108" stroke="rgba(30,58,138,.3)" strokeWidth="1.5" />
    <rect x="68" y="103" width="22" height="19" rx="4" fill="rgba(255,255,255,.35)" />
    <rect x="97" y="108" width="16" height="13" rx="3" fill="rgba(255,255,255,.3)" />
    <circle cx="178" cy="52" r="16" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="2" />
    <path d="M178 38C171 38 166 43 166 51C166 60 178 70 178 70S190 60 190 51C190 43 185 38 178 38Z" fill="white" fillOpacity=".9" />
    <circle cx="178" cy="51" r="4.5" fill="#2563eb" />
    <path d="M44 72 Q100 48 162 58" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" strokeDasharray="5 4" fill="none" />
    <polygon points="162,54 167,58 162,63" fill="rgba(255,255,255,.6)" />
    <circle cx="15" cy="55" r="2.5" fill="rgba(255,255,255,.4)" />
    <circle cx="196" cy="98" r="2" fill="rgba(255,255,255,.35)" />
    <rect x="10" y="24" width="26" height="24" rx="5" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
    <line x1="10" y1="34" x2="36" y2="34" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
    <line x1="23" y1="24" x2="23" y2="34" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
  </svg>
);

const LogoSvg = () => (
  <div className="logo-icon">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="6" width="13" height="10" rx="2.5" fill="white" fillOpacity=".9" />
      <rect x="13" y="9" width="7" height="7" rx="2" fill="white" fillOpacity=".7" />
      <circle cx="5" cy="17" r="2" fill="#93c5fd" />
      <circle cx="16" cy="17" r="2" fill="#93c5fd" />
    </svg>
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const type = res.data?.user?.type;
      if (type === "Admin") navigate("/admin");
      else if (type === "Transporter") navigate("/transporter");
      else navigate("/user");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">

        {/* ── Left Panel ── */}
        <div className="auth-panel-left">
          <TruckIllustration />
          <div className="auth-panel-tagline">
            <h2>Welcome Back!</h2>
            <p>Sign in to manage your deliveries, track jobs, and get the best bids on MOVEIT.</p>
          </div>
          <div className="auth-badges">
            <span className="auth-badge">🚚 Fast Delivery</span>
            <span className="auth-badge">💰 Best Bids</span>
            <span className="auth-badge">📍 Live Tracking</span>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="auth-panel-right">
          <Link to="/" className="logo">
            <LogoSvg />
            <span className="logo-text">MOVE<span>IT</span></span>
          </Link>

          <div className="form-heading">
            <h1>Sign in to your account</h1>
            <p>Enter your email and password to continue.</p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                <path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1zm0 10a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.75a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 1.5 0v1.75z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="form-body" onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Email */}
              <div className="field">
                <label>Email Address <span className="req">*</span></label>
                <div className="input-wrap">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="1" y="3" width="14" height="10" rx="2" />
                    <path d="m1 5 7 5 7-5" />
                  </svg>
                  <input
                    type="email" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email" required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label>Password <span className="req">*</span></label>
                <div className="input-wrap">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="7" width="10" height="8" rx="2" />
                    <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                    <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Your password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" required
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? "Hide password" : "Show password"}>
                    {showPwd
                      ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 1l14 14M6.5 6.7A3.5 3.5 0 0 0 8 12.5 7 7 0 0 0 14 8M1 8S3.5 3 8 3a6.5 6.5 0 0 1 3 .7" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 8S3.5 3 8 3s7 5 7 5-2.5 5-7 5S1 8 1 8z" /><circle cx="8" cy="8" r="2" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: "-6px" }}>
                <a href="#" style={{ fontSize: ".78rem", color: "var(--blue-600)", fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "4px" }}>
                <div className={`spinner ${loading ? "active" : ""}`} />
                {loading ? "Signing in…" : "Sign In"}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </form>

          <div className="divider">or</div>
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

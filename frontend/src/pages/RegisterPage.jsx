import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { GoogleLogin } from '@react-oauth/google';

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

const TruckIllustration = () => (
  <svg width="220" height="168" viewBox="0 0 220 168" fill="none" aria-hidden="true"
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
    <path d="M178 38C171 38 166 43 166 51C166 60 178 70 178 70S190 60 190 51C190 43 185 38 178 38Z"
      fill="white" fillOpacity=".9" />
    <circle cx="178" cy="51" r="4.5" fill="#2563eb" />
    <path d="M44 72 Q100 48 162 58" stroke="rgba(255,255,255,.5)" strokeWidth="1.8"
      strokeDasharray="5 4" fill="none" />
    <polygon points="162,54 167,58 162,63" fill="rgba(255,255,255,.6)" />
  </svg>
);

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: "", password: "", confirmPassword: "",
    type: "", fullName: "", address: "", mobileNumber: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    if (!form.type) {
      setError("Please select a role."); return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await api.post("/auth/register", payload);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    if (!form.type) {
      setError("Please select a role (User or Transporter) before signing up with Google.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { 
        token: credentialResponse.credential,
        type: form.type
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Google Sign Up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign Up failed. Please try again.");
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-panel-left">
          <TruckIllustration />
          <div className="auth-panel-tagline">
            <h2>Move Smarter,<br />Bid Better</h2>
            <p>Join thousands of users & transporters on India's fastest growing logistics platform.</p>
          </div>
          <div className="auth-badges">
            <span className="auth-badge">🚚 Fast Delivery</span>
            <span className="auth-badge">💰 Best Bids</span>
            <span className="auth-badge">📍 Live Tracking</span>
          </div>
        </div>
        <div className="auth-panel-right">
          <Link to="/" className="logo">
            <LogoSvg />
            <span className="logo-text">MOVE<span>IT</span></span>
          </Link>
          {success ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{
                width: 68, height: 68,
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: "0 6px 20px rgba(34,197,94,.35)"
              }}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <circle cx="15" cy="15" r="15" fill="#fff" fillOpacity=".15" />
                  <path d="M6 15l6 6 12-12" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ marginBottom: 8 }}>You're all set! 🎉</h2>
              <p>Account created. Redirecting to sign in…</p>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <h1>Create your account</h1>
                <p>Fill in the details below to get started for free.</p>
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
                <div className="form-grid">
                  {/* Full Name */}
                  <div className="field full-col">
                    <label>Full Name <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" />
                      </svg>
                      <input name="fullName" type="text" placeholder="e.g. Arjun Sharma"
                        value={form.fullName} onChange={handleChange} required autoComplete="name" />
                    </div>
                  </div>
                  {/* Email */}
                  <div className="field">
                    <label>Email Address <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="1" y="3" width="14" height="10" rx="2" /><path d="m1 5 7 5 7-5" />
                      </svg>
                      <input name="email" type="email" placeholder="you@example.com"
                        value={form.email} onChange={handleChange} required autoComplete="email" />
                    </div>
                  </div>
                  {/* Mobile */}
                  <div className="field">
                    <label>Mobile Number <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="4" y="1" width="8" height="14" rx="2" />
                        <circle cx="8" cy="12.5" r=".6" fill="currentColor" stroke="none" />
                      </svg>
                      <input name="mobileNumber" type="tel" placeholder="+91 98765 43210"
                        value={form.mobileNumber} onChange={handleChange} required maxLength={15} autoComplete="tel" />
                    </div>
                  </div>
                  {/* Role */}
                  <div className="field">
                    <label>I am a <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M2 12s1.5-2 4-2 4 2 4 2" /><circle cx="6" cy="7" r="2.5" />
                        <path d="M12 7v5M10 9l2 2 2-2" />
                      </svg>
                      <select name="type" value={form.type} onChange={handleChange} required>
                        <option value="" disabled>Select role…</option>
                        <option value="User">User</option>
                        <option value="Transporter">Transporter</option>
                      </select>
                      <svg className="select-chevron" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 4l4.5 4.5L11 4" />
                      </svg>
                    </div>
                  </div>
                  {/* Password */}
                  <div className="field">
                    <label>Password <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="3" y="7" width="10" height="8" rx="2" /><path d="M5 7V5a3 3 0 0 1 6 0v2" />
                        <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
                      </svg>
                      <input name="password" type={showPwd ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={form.password} onChange={handleChange} required autoComplete="new-password" />
                      <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}
                        aria-label={showPwd ? "Hide" : "Show"}>
                        {showPwd
                          ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 1l14 14M6.5 6.7A3.5 3.5 0 0 0 8 12.5 7 7 0 0 0 14 8M1 8S3.5 3 8 3a6.5 6.5 0 0 1 3 .7" /></svg>
                          : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 8S3.5 3 8 3s7 5 7 5-2.5 5-7 5S1 8 1 8z" /><circle cx="8" cy="8" r="2" /></svg>
                        }
                      </button>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div className="field">
                    <label>Confirm Password <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="3" y="7" width="10" height="8" rx="2" /><path d="M5 7V5a3 3 0 0 1 6 0v2" />
                        <path d="M6 11l1.5 1.5L10 10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <input name="confirmPassword" type={showPwd ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
                    </div>
                  </div>
                  {/* Address */}
                  <div className="field full-col">
                    <label>Address <span className="req">*</span></label>
                    <div className="input-wrap" style={{ alignItems: "flex-start" }}>
                      <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"
                        stroke="currentColor" strokeWidth="1.6" style={{ top: 12, position: "absolute" }}>
                        <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z" />
                        <circle cx="8" cy="6" r="1.8" />
                      </svg>
                      <textarea name="address" rows={3}
                        placeholder="House/Flat No., Street, City, State, PIN code"
                        value={form.address} onChange={handleChange} required
                        style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                </div>{/* /form-grid */}
                <p className="terms-note">
                  By registering you agree to our{" "}
                  <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                </p>
                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 16 }}>
                  <div className={`spinner ${loading ? "active" : ""}`} />
                  {loading ? "Creating account…" : "Create Account"}
                  {!loading && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>
              <div className="divider">or</div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  shape="pill"
                  text="signup_with"
                />
              </div>

              <p className="auth-footer">
                Already have an account? <Link to="/login">Sign in →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

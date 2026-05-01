import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    mobileNumber: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setLoading(true);
    setError("");
    try {
      const userRes = await api.get("/auth/me");
      setUser(userRes.data.user);

      // Try loading profile; if profile is not created (404), treat as empty profile
      try {
        const profileRes = await api.get("/auth/profile");
        setProfile(profileRes.data.profile);
        setFormData({
          fullName: profileRes.data.profile?.fullName || "",
          address: profileRes.data.profile?.address || "",
          mobileNumber: profileRes.data.profile?.mobileNumber || "",
        });
      } catch (pErr) {
        console.error("Profile load error:", pErr);
        if (pErr.response?.status === 404) {
          // No profile yet — not an error condition for the UI
          setProfile(null);
          setFormData({ fullName: "", address: "", mobileNumber: "" });
        } else if (pErr.response?.status === 401) {
          setError("Please log in to view your profile.");
        } else {
          const msg = pErr.response?.data?.message || "Failed to load profile information.";
          setError(msg + (pErr.response?.status ? ` (status ${pErr.response.status})` : ""));
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.response?.status === 401 ? "Please log in to view your profile." : "Failed to load user information.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName || !formData.address || !formData.mobileNumber) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await api.put("/auth/profile", {
        fullName: formData.fullName,
        address: formData.address,
        mobileNumber: formData.mobileNumber,
      });
      setProfile(res.data.profile);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      const serverMsg = err.response?.data?.message;
      const status = err.response?.status;
      const msg = serverMsg || (status ? `Request failed (status ${status})` : err.message) || "Failed to update profile.";
      setError(msg);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dash-header">
          <h2>User Information</h2>
          <button className="btn-ghost" onClick={() => navigate("/user-dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="card">
          <p style={{ color: "var(--slate-400)" }}>Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2>User Information</h2>
          <p>View and manage your profile details.</p>
        </div>
        <button className="btn-ghost" onClick={() => navigate("/user-dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Error & Success Messages */}
      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {success && <div className="alert alert-success"><span>{success}</span></div>}

      {/* User Information Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8.5" cy="5.5" r="3.5" />
              <path d="M2 14c0-2 2.5-3.5 6.5-3.5s6.5 1.5 6.5 3.5" />
            </svg>
            Profile Information
          </h3>
          {!isEditing && (
            <button
              className="btn-primary"
              style={{ padding: "8px 20px", fontSize: ".85rem", width: "auto" }}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {!isEditing ? (
          // View Mode
          <div className="profile-view">
            <div className="info-row">
              <label className="info-label">Email Address</label>
              <p className="info-value">{user?.email}</p>
            </div>

            <div className="info-row">
              <label className="info-label">Full Name</label>
              <p className="info-value">{profile?.fullName || "Not provided"}</p>
            </div>

            <div className="info-row">
              <label className="info-label">Address</label>
              <p className="info-value">{profile?.address || "Not provided"}</p>
            </div>

            <div className="info-row">
              <label className="info-label">Mobile Number</label>
              <p className="info-value">{profile?.mobileNumber || "Not provided"}</p>
            </div>

            <div className="info-row">
              <label className="info-label">Account Type</label>
              <p className="info-value">
                <span
                  className="badge"
                  style={{
                    backgroundColor: user?.type === "User" ? "var(--blue-100)" : "var(--slate-200)",
                    color: user?.type === "User" ? "var(--blue-700)" : "var(--slate-700)",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: ".85rem",
                    fontWeight: 500,
                    display: "inline-block",
                  }}
                >
                  {user?.type}
                </span>
              </p>
            </div>

            {profile?.createdAt && (
              <div className="info-row">
                <label className="info-label">Member Since</label>
                <p className="info-value">
                  {new Date(profile.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleUpdateProfile}>
            <div className="card-form-grid">
              <label className="field-label">
                Full Name
                <input
                  className="plain-input"
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label className="field-label">
                Address
                <input
                  className="plain-input"
                  type="text"
                  name="address"
                  placeholder="Your address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label className="field-label">
                Mobile Number
                <input
                  className="plain-input"
                  type="tel"
                  name="mobileNumber"
                  placeholder="Your mobile number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button type="submit" className="btn-primary" style={{ padding: "10px 24px", width: "auto" }}>
                Save Changes
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "10px 24px", width: "auto" }}
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: profile?.fullName || "",
                    address: profile?.address || "",
                    mobileNumber: profile?.mobileNumber || "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Additional Info Card */}
      <div className="card">
        <h3>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="7.5" />
            <path d="M8.5 5v4.5M5.5 8.5h6" strokeLinecap="round" />
          </svg>
          Account Settings
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--slate-50)",
              borderRadius: "8px",
              border: "1px solid var(--slate-200)",
            }}
          >
            <p style={{ fontSize: ".9rem", color: "var(--slate-600)", margin: 0 }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ fontSize: ".85rem", color: "var(--slate-400)", margin: "8px 0 0 0" }}>
              Your email is your unique account identifier and cannot be changed.
            </p>
          </div>
          <button
            className="btn-ghost"
            style={{ width: "auto", padding: "10px 0", textAlign: "left", color: "var(--red-600)" }}
            onClick={() => navigate("/login")}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;

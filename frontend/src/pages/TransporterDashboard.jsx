import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const TransporterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidError, setBidError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMyJobs = async () => {
    try {
      const res = await api.get("/bids/my-jobs");
      setMyJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    loadJobs().catch(console.error);
    loadMyJobs().catch(console.error);
  }, []);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!selectedJobId) return;
    setBidError(""); setBidSuccess(""); setLoading(true);
    try {
      await api.post(`/bids/${selectedJobId}`, { amount, description });
      setAmount(""); setDescription(""); setSelectedJobId("");
      setBidSuccess("Bid placed successfully! The job owner will review your offer.");
      await loadMyJobs(); // Reload accepted jobs in case status changed
    } catch (err) {
      setBidError(err.response?.data?.message || "Failed to place bid.");
    } finally { setLoading(false); }
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="dashboard-wrapper">
      <div className="dash-header">
        <div>
          <h2>Transporter Dashboard</h2>
          <p>Browse open jobs and submit your competitive bids.</p>
        </div>
        <button className="btn-ghost" onClick={() => navigate("/login")}>Sign Out</button>
      </div>

      {/* Stats */}
      <div className="dash-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="7" width="18" height="13" rx="3" />
              <path d="M7 7V5a4 4 0 0 1 8 0v2" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-label">Available Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{myJobs.length}</div>
            <div className="stat-label">Accepted Jobs</div>
          </div>
        </div>
      </div>

      {/* My Accepted Jobs */}
      {myJobs.length > 0 && (
        <div className="card">
          <h3>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 4L6 13l-4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            My Accepted Jobs
          </h3>
          {myJobs.map((bid) => (
            <div
              key={bid._id}
              className="job-item"
              style={{
                background: "var(--green-50)",
                borderRadius: "var(--radius-sm)",
                padding: "14px 12px",
                marginBottom: "8px"
              }}>
              <div className="job-info">
                <div className="job-route">
                  📍 {bid.job?.fromCity?.name || "—"} → {bid.job?.toCity?.name || "—"}
                </div>
                <div style={{ fontSize: ".75rem", color: "var(--blue-600)", fontWeight: 600, marginTop: "4px" }}>
                  📅 Transport Date: {bid.job?.transportDate ? new Date(bid.job?.transportDate).toLocaleDateString() : "—"}
                </div>
                <div className="job-desc">{bid.job?.description}</div>
                <div style={{ fontSize: ".8rem", color: "var(--slate-600)", marginTop: "6px" }}>
                  <strong>Customer:</strong> {bid.job?.user?.email || "—"} | <strong>Your Bid:</strong> ₹{bid.amount}
                </div>
              </div>
              <span className="pill pill-success">✓ Accepted</span>
            </div>
          ))}
        </div>
      )}

      {/* Open Jobs */}
      <div className="card">
        <h3>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="3" width="13" height="12" rx="2" />
            <path d="M5 7h7M5 10h5" strokeLinecap="round" />
          </svg>
          Open Jobs — Select to Bid
        </h3>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--slate-300)" strokeWidth="1.8">
              <rect x="5" y="10" width="30" height="24" rx="4" /><path d="M13 10V8a3 3 0 0 1 6 0v2M5 18h30" />
            </svg>
            <p>No open jobs at the moment. Check back soon!</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job._id}
              className="job-item"
              onClick={() => setSelectedJobId(job._id === selectedJobId ? "" : job._id)}
              style={{
                cursor: "pointer",
                background: selectedJobId === job._id ? "var(--blue-50)" : "transparent",
                borderRadius: "var(--radius-sm)", padding: "14px 12px",
                transition: "background var(--transition)",
              }}>
              <div className="job-info">
                <div className="job-route">
                  {selectedJobId === job._id
                    ? <span style={{ color: "var(--blue-700)" }}>✓ Selected — </span>
                    : null}
                  📍 {job.fromCity?.name || "—"} → {job.toCity?.name || "—"}
                </div>
                <div style={{ fontSize: ".75rem", color: "var(--blue-600)", fontWeight: 600, marginTop: "4px" }}>
                  📅 Transport Date: {job.transportDate ? new Date(job.transportDate).toLocaleDateString() : "—"}
                </div>
                <div className="job-desc">{job.description}</div>
              </div>
              <span className="pill pill-open">Open</span>
            </div>
          ))
        )}
      </div>

      {/* Place Bid */}
      <div className="card">
        <h3>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 12l3-3 2 2 4-4 4 4" /><rect x="2" y="3" width="13" height="12" rx="2" />
          </svg>
          {selectedJob
            ? `Place Bid — ${selectedJob.fromCity?.name || "?"} → ${selectedJob.toCity?.name || "?"}`
            : "Place Bid — Select a Job Above"}
        </h3>

        {bidSuccess && <div className="alert alert-success" role="status"><span>✓ {bidSuccess}</span></div>}
        {bidError && <div className="alert alert-error" role="alert"><span>{bidError}</span></div>}

        <form className="card-form" onSubmit={handleBid}>
          <div className="card-form-grid">
            <label className="field-label">
              Bid Amount (₹) *
              <input
                className="plain-input"
                type="number" min="1" step="1"
                placeholder="e.g. 4500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={!selectedJobId}
              />
            </label>
            <label className="field-label" style={{ gridColumn: "1/-1" }}>
              Message to Customer
              <textarea
                className="plain-input"
                rows={3} placeholder="Describe your service, estimated time, vehicle type…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", marginTop: 0 }}
              />
            </label>
          </div>
          <div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "auto", padding: "10px 28px" }}
              disabled={!selectedJobId || loading}>
              <div className={`spinner ${loading ? "active" : ""}`} />
              {loading ? "Submitting…" : "Submit Bid →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransporterDashboard;

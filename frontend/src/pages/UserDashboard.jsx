import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const UserDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [bids, setBids] = useState([]);
  const [bidsError, setBidsError] = useState("");
  const [loadingBids, setLoadingBids] = useState(false);
  const [jobSuccess, setJobSuccess] = useState("");
  const [form, setForm] = useState({
    fromCity: "", fromAddress: "", toCity: "", toAddress: "", description: "", transportDate: "",
  });
  const navigate = useNavigate();

  const loadJobs = async () => {
    setError("");
    try {
      const res = await api.get("/jobs", { params: { mine: true } });
      setJobs(res.data);
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.response?.status === 401 ? "Please log in as a User to view your jobs." : "Failed to load jobs.");
      setError(msg);
    }
  };

  useEffect(() => { loadJobs().catch(console.error); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError(""); setJobSuccess("");
    try {
      await api.post("/jobs", form);
      setForm({ fromCity: "", fromAddress: "", toCity: "", toAddress: "", description: "", transportDate: "" });
      setJobSuccess("Job posted successfully!");
      await loadJobs();
    } catch (err) {
      console.error("Job creation error:", err.response);
      let msg = err.response?.data?.message;
      if (err.response?.status === 401) {
        msg = "You must be logged in as a User to create a job.";
      } else if (err.response?.status === 403) {
        msg = "Access denied. Only User accounts can post jobs. Please login as a User, not a Transporter.";
      } else if (!msg) {
        msg = "Failed to create job.";
      }
      setError(msg);
    }
  };

  const loadBidsForJob = async (jobId) => {
    setBidsError(""); setLoadingBids(true);
    try {
      const res = await api.get(`/bids/job/${jobId}`);
      setBids(res.data);
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.response?.status === 401 ? "You must be logged in as a User to view bids." : "Failed to load bids.");
      setBidsError(msg);
    } finally { setLoadingBids(false); }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    if (jobId) loadBidsForJob(jobId);
    else setBids([]);
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await api.post(`/bids/${bidId}/accept`);
      await loadBidsForJob(selectedJobId);
      await loadJobs();
    } catch (err) {
      setBidsError(err.response?.data?.message || "Failed to accept bid.");
    }
  };

  const statusPill = (job) => {
    if (job.isCompleted) return <span className="pill pill-done">✓ Completed</span>;
    if (job.isCanceled) return <span className="pill pill-canceled">✕ Cancelled</span>;
    return <span className="pill pill-open">● Open</span>;
  };

  const openJobs = jobs.filter(j => !j.isCompleted && !j.isCanceled);
  const doneJobs = jobs.filter(j => j.isCompleted || j.isCanceled);

  return (
    <div className="dashboard-wrapper">
      {/* ... dash-header and tiles remain same ... */}
      <div className="dash-header">
        <div>
          <h2>User Dashboard</h2>
          <p>Manage your shipments and review transporter bids.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-secondary" onClick={() => { navigate("/user-info"); }} style={{ width: "auto" }}>
            👤 My Profile
          </button>
          <button className="btn-ghost" onClick={() => { navigate("/login"); }}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="dash-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="7" width="18" height="13" rx="3" /><path d="M7 7V5a4 4 0 0 1 8 0v2" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="9" /><path d="M7 11l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{doneJobs.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="9" /><path d="M11 7v4l3 3" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{openJobs.length}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="7.5" /><path d="M8.5 5v7M5 8.5h7" strokeLinecap="round" />
          </svg>
          Post a New Job
        </h3>
        {error && <div className="alert alert-error" role="alert"><span>{error}</span></div>}
        {jobSuccess && <div className="alert alert-success" role="status"><span>{jobSuccess}</span></div>}
        <form className="card-form" onSubmit={handleCreateJob}>
          <div className="card-form-grid">
            <label className="field-label">
              From City
              <input className="plain-input" name="fromCity" placeholder="Origin city"
                value={form.fromCity} onChange={handleChange} required />
            </label>
            <label className="field-label">
              To City
              <input className="plain-input" name="toCity" placeholder="Destination city"
                value={form.toCity} onChange={handleChange} required />
            </label>
            <label className="field-label">
              Pick-up Address
              <input className="plain-input" name="fromAddress" placeholder="From address"
                value={form.fromAddress} onChange={handleChange} required />
            </label>
            <label className="field-label">
              Drop Address
              <input className="plain-input" name="toAddress" placeholder="To address"
                value={form.toAddress} onChange={handleChange} required />
            </label>
            <label className="field-label">
              Transport Date
              <input className="plain-input" type="date" name="transportDate"
                value={form.transportDate} onChange={handleChange} required />
            </label>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="field-label" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                Job Description
                <textarea className="plain-input" name="description" rows={3}
                  placeholder="Describe your goods (type, weight, special handling…)"
                  value={form.description} onChange={handleChange} required
                  style={{ marginTop: 0, width: "100%" }} />
              </label>
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <button type="submit" className="btn-primary" style={{ width: "auto", padding: "10px 28px" }}>
              Post Job →
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="3" width="13" height="12" rx="2" />
            <path d="M5 7h7M5 10h5" strokeLinecap="round" />
          </svg>
          My Jobs
        </h3>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--slate-300)" strokeWidth="1.8">
              <rect x="5" y="10" width="30" height="24" rx="4" /><path d="M13 10V8a3 3 0 0 1 6 0v2M5 18h30" />
            </svg>
            <p>No jobs yet. Post your first job above!</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div className="job-item" key={job._id}>
              <div className="job-info">
                <div className="job-route">
                  📍 {job.fromCity?.name || "—"} → {job.toCity?.name || "—"}
                </div>
                <div style={{ fontSize: ".8rem", color: "var(--blue-600)", fontWeight: 600, margin: "4px 0" }}>
                  📅 Transport Date: {job.transportDate ? new Date(job.transportDate).toLocaleDateString() : "—"}
                </div>
                <div className="job-desc">{job.description}</div>
                <div style={{ marginTop: 6 }}>{statusPill(job)}</div>
              </div>
              <div className="job-actions">
                {!job.isCompleted && !job.isCanceled && (
                  <button
                    className={selectedJobId === job._id ? "btn-primary" : "btn-secondary"}
                    style={{ padding: "7px 16px", fontSize: ".8rem", width: "auto" }}
                    onClick={() => handleSelectJob(job._id)}>
                    {selectedJobId === job._id ? "↻ Refresh Bids" : "View Bids"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bids Panel */}
      {selectedJobId && (
        <div className="card">
          <h3>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 12l3-3 2 2 4-4 4 4" /><rect x="2" y="3" width="13" height="12" rx="2" />
            </svg>
            Bids for Selected Job
          </h3>
          {loadingBids && <p style={{ color: "var(--slate-400)", fontSize: ".85rem" }}>Loading bids…</p>}
          {bidsError && <div className="alert alert-error">{bidsError}</div>}
          {!loadingBids && !bidsError && bids.length === 0 && (
            <div className="empty-state">
              <p>No bids received yet for this job.</p>
            </div>
          )}
          {!loadingBids && bids.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Transporter</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr key={bid._id}>
                      <td>{bid.user?.email || "—"}</td>
                      <td style={{ fontWeight: 600, color: "var(--blue-700)" }}>
                        ₹{bid.amount?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        {bid.isAccepted
                          ? <span className="pill pill-accepted">✓ Accepted</span>
                          : <span className="pill pill-pending">● Pending</span>}
                      </td>
                      <td>
                        {!bid.isAccepted && (
                          <button className="btn-secondary" style={{ fontSize: ".78rem", padding: "5px 14px" }}
                            onClick={() => handleAcceptBid(bid._id)}>
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, j, b] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/jobs"),
          api.get("/admin/bids"),
        ]);
        setUsers(u.data);
        setJobs(j.data);
        setBids(b.data);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getBidsForJob = (jobId) => bids.filter(b => b.job?._id === jobId || b.job === jobId);

  const tabs = [
    { key: "users", label: "Users", count: users.length },
    { key: "jobs", label: "Parcels", count: jobs.length },
    { key: "bids", label: "Bids", count: bids.length },
  ];

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="empty-state" style={{ minHeight: "60vh" }}>
          <div className="spinner active" style={{ width: 40, height: 40, borderTopColor: "var(--blue-600)" }} />
          <p style={{ marginTop: 20 }}>Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dash-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Complete overview of platform users, parcels, and transporter bids.</p>
        </div>
        <button className="btn-ghost" onClick={() => navigate("/login")}>Sign Out</button>
      </div>

      {/* Stats Overview */}
      <div className="dash-grid">
        {[
          { label: "Total Users", value: users.length, color: "blue", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { label: "Total Parcels", value: jobs.length, color: "amber", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
          { label: "Active Bids", value: bids.filter(b => !b.isAccepted).length, color: "green", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 17-3-5 3-5"/><path d="m19 17 3-5-3-5"/></svg> },
          { label: "Matches Made", value: bids.filter(b => b.isAccepted).length, color: "red", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l9.94-9.94 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--slate-200)", paddingBottom: 2 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: "transparent",
              color: tab === t.key ? "var(--blue-700)" : "var(--slate-500)",
              border: "none",
              borderBottom: tab === t.key ? "2.5px solid var(--blue-600)" : "2.5px solid transparent",
              padding: "10px 4px",
              fontFamily: "inherit", fontSize: ".9rem", fontWeight: 600,
              cursor: "pointer", transition: "all var(--transition)",
              marginBottom: "-1px", display: "flex", alignItems: "center", gap: 8
            }}>
            {t.label}
            <span style={{
              background: tab === t.key ? "var(--blue-600)" : "var(--slate-200)",
              color: tab === t.key ? "white" : "var(--slate-600)",
              borderRadius: 50, padding: "1px 8px", fontSize: ".72rem", fontWeight: 700,
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {tab === "users" && (
          <div className="table-wrap">
            <table style={{ margin: 0 }}>
              <thead>
                <tr><th>User Info</th><th>Type</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="3" className="empty-state">No users registered yet.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--blue-900)" }}>{u.fullName || "Unnamed User"}</div>
                        <div style={{ fontSize: ".75rem", color: "var(--slate-500)" }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`pill ${u.type === "Admin" ? "pill-canceled" : u.type === "Transporter" ? "pill-accepted" : "pill-open"}`}>
                          {u.type}
                        </span>
                      </td>
                      <td style={{ color: "var(--slate-500)", fontSize: ".8rem" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "jobs" && (
          <div className="table-wrap">
            <table style={{ margin: 0 }}>
              <thead>
                <tr><th>Parcel Details</th><th>Route</th><th>Status</th><th>Bids</th></tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr><td colSpan="4" className="empty-state">No parcels posted yet.</td></tr>
                ) : (
                  jobs.map((j) => {
                    const jobBids = getBidsForJob(j._id);
                    return (
                      <tr key={j._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--blue-900)", maxWidth: 300 }} className="text-truncate">
                            {j.description}
                          </div>
                          <div style={{ fontSize: ".75rem", color: "var(--slate-500)" }}>
                            Owner: {j.user?.email || "Unknown"}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".85rem" }}>
                            <span style={{ fontWeight: 500 }}>{j.fromCity?.name}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                            <span style={{ fontWeight: 500 }}>{j.toCity?.name}</span>
                          </div>
                          <div style={{ fontSize: ".7rem", color: "var(--slate-400)", marginTop: 2 }}>{j.fromAddress}</div>
                          <div style={{ fontSize: ".72rem", color: "var(--blue-600)", fontWeight: 600, marginTop: 4 }}>
                            📅 {j.transportDate ? new Date(j.transportDate).toLocaleDateString() : "No date"}
                          </div>
                        </td>
                        <td>
                          {j.isCompleted ? (
                            <span className="pill pill-done">Delivered</span>
                          ) : j.isCanceled ? (
                            <span className="pill pill-canceled">Cancelled</span>
                          ) : jobBids.some(b => b.isAccepted) ? (
                            <span className="pill pill-accepted" style={{ background: "var(--blue-50)", color: "var(--blue-600)", border: "1px solid var(--blue-100)" }}>
                              In Progress
                            </span>
                          ) : (
                            <span className="pill pill-open">Seeking Bids</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 700, color: jobBids.length > 0 ? "var(--blue-600)" : "var(--slate-400)" }}>
                              {jobBids.length}
                            </span>
                            <span style={{ fontSize: ".7rem", color: "var(--slate-500)" }}>Bids</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "bids" && (
          <div className="table-wrap">
            <table style={{ margin: 0 }}>
              <thead>
                <tr><th>Transporter</th><th>Parcel / Job</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bids.length === 0 ? (
                  <tr><td colSpan="4" className="empty-state">No bids submitted yet.</td></tr>
                ) : (
                  bids.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--blue-900)" }}>{b.user?.fullName || "Transporter"}</div>
                        <div style={{ fontSize: ".75rem", color: "var(--slate-500)" }}>{b.user?.email}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: 200, fontSize: ".85rem" }} className="text-truncate">
                          {b.job?.description || "Deleted Job"}
                        </div>
                        <div style={{ fontSize: ".7rem", color: "var(--slate-500)" }}>
                          {b.job?.fromCity?.name} → {b.job?.toCity?.name}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--blue-700)", fontSize: "1rem" }}>
                        ₹{Number(b.amount)?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        {b.isAccepted ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--success)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                            <span style={{ fontWeight: 600 }}>Accepted</span>
                          </div>
                        ) : (
                          <span className="pill pill-pending">Pending Review</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => (
  <>
    {/* ── Hero ── */}
    <section className="hero-section">
      <div className="hero-content">
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)",
          borderRadius: 50, padding: "5px 14px", marginBottom: 20,
          fontSize: ".78rem", fontWeight: 600, color: "white",
          backdropFilter: "blur(6px)"
        }}>
          🚀 India's #1 goods transport bidding platform
        </div>
        <h1>Move Anything,<br />Anywhere — Best Price</h1>
        <p>
          Post your goods delivery job and let verified transporters compete for the
          best price. Hassle-free, transparent, and lightning fast.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="cta-primary">Get Started Free</Link>
          <Link to="/login" className="cta-outline">Sign In</Link>
        </div>
      </div>

      <div className="hero-features">
        {[
          { icon: "📦", title: "Post a Job", desc: "Describe your goods and route in seconds" },
          { icon: "💰", title: "Receive Bids", desc: "Transporters bid competitively for your job" },
          { icon: "✅", title: "Accept Best Bid", desc: "Pick the best offer and confirm instantly" },
          { icon: "🚚", title: "Track Delivery", desc: "Live updates until your goods arrive" },
        ].map((f) => (
          <div className="hero-feature" key={f.title}>
            <div className="hero-feature-icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default HomePage;

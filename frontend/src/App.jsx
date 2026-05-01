import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import UserInfo from "./pages/UserInfo";
import TransporterDashboard from "./pages/TransporterDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const LogoIcon = () => (
  <div className="navbar-logo-icon">
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <rect x="1" y="5" width="12" height="10" rx="2.5" fill="white" fillOpacity=".9" />
      <rect x="12" y="8" width="7" height="7" rx="2" fill="white" fillOpacity=".7" />
      <circle cx="4.5" cy="16.5" r="2" fill="#93c5fd" />
      <circle cx="15" cy="16.5" r="2" fill="#93c5fd" />
    </svg>
  </div>
);

const App = () => {
  const location = useLocation();
  const hiddenNavRoutes = ["/login", "/register"];
  const showNav = !hiddenNavRoutes.includes(location.pathname);

  return (
    <>
      {showNav && (
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <LogoIcon />
            MOVE<span>IT</span>
          </Link>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="nav-btn">Get Started</Link>
          </div>
        </nav>
      )}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/transporter" element={<TransporterDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiDocumentText } from 'react-icons/hi2';

export const NavBar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const { user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <nav style={styles.nav}>
      {/* Government Logo & App Name */}
      <div style={styles.logoSection} onClick={() => navigate("/")}>
        <div style={styles.emblem}>🏛️</div>
        <div style={styles.logoText}>
          <div style={styles.appName}>CivicResolve</div>
          <div style={styles.tagline}>Complaint Portal</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={styles.actions}>
        {user ? (
          <>
            {user.role === 'citizen' && (
              <button onClick={() => navigate("/citizen/file-complaint")} className="btn-gradient-cta" style={styles.fileBtn}>
                <HiDocumentText style={{display: 'inline', marginRight: '4px'}} />File Complaint
              </button>
            )}
            <div style={styles.profileContainer} onClick={() => navigate(`/${user.role}/profile`)}>
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt="Profile"
                style={styles.profileImage}
              />
            </div>
            <button onClick={() => logout()} className="btn-gradient-ghost" style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <button onClick={() => navigate("/citizen/login")} className="btn-gradient-primary" style={styles.loginBtn}>Login</button>
        )}

        {user && (user.role === 'admin' || user.role === 'official') && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={styles.themeToggle}
            title="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        )}

      </div>
    </nav>
  );
};

const styles = {
  nav: {
    height: "70px",
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "var(--card)",
    borderBottom: "2px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "var(--shadow-sm)",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },

  emblem: {
    width: "45px",
    height: "45px",
    background: "linear-gradient(135deg, var(--gov-blue) 0%, var(--gov-blue-light) 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    boxShadow: "var(--shadow-sm)",
  },

  logoText: {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
  },

  appName: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text)",
    lineHeight: 1,
  },

  tagline: {
    fontSize: "0.6875rem",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "500",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  fileBtn: {
    padding: "0.625rem 1.25rem",
    borderRadius: "8px",
    background: "linear-gradient(135deg, var(--gov-saffron) 0%, var(--gov-orange) 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: "600",
    boxShadow: "var(--shadow-sm)",
    transition: "all 0.2s ease",
  },

  logoutBtn: {
    padding: "0.625rem 1rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },

  loginBtn: {
    padding: "0.625rem 1.5rem",
    borderRadius: "8px",
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: "600",
    boxShadow: "var(--shadow-sm)",
    transition: "all 0.2s ease",
  },

  profileContainer: {
    cursor: 'pointer',
    transition: "transform 0.2s ease",
  },

  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--primary)',
    boxShadow: "var(--shadow-sm)",
  },

  themeToggle: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    cursor: 'pointer',
    fontSize: '1.125rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: "all 0.2s ease",
  },
};

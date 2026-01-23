import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, count, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={styles.statTitle}>{title}</div>
    <div style={styles.statCount}>{count}</div>
  </div>
);

export default function Sidebar() {
  const [summary, setSummary] = useState({ open: 0, inProgress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

      try {
        const [summaryRes, recentRes, notifRes] = await Promise.all([
          fetch('/api/citizen/dashboard', { headers }),
          fetch('/api/citizen/complaints/recent', { headers }),
          fetch('/api/citizen/notifications', { headers }),
        ]);

        const summaryData = await summaryRes.json();
        const recentData = await recentRes.json();
        const notifData = await notifRes.json();

        if (summaryData.success) setSummary(summaryData.summary);
        if (recentData.success) setRecentComplaints(recentData.complaints);
        if (notifData.success) setNotifications(notifData.notifications);
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: '1.5rem' }}>Loading...</div>;
  }

  return (
    <>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Overview</h3>
        <StatCard title="Open Complaints" count={summary.open} color="#f97316" />
        <StatCard title="In Progress" count={summary.inProgress} color="#3b82f6" />
        <StatCard title="Resolved" count={summary.resolved} color="#22c55e" />
      </div>

      <div style={styles.section}>
        <Link to="/citizen/my-complaints" style={styles.sectionTitleLink}>
          <h3 style={styles.sectionTitle}>Recent Complaints</h3>
        </Link>
        <ul style={styles.list}>
          {recentComplaints.length > 0 ? (
            recentComplaints.map((c) => (
              <li key={c._id} style={styles.listItem}>
                <Link to={`/citizen/complaint/${c._id}`} style={styles.link}>{c.title}</Link>
                <span style={styles.statusBadge}>{c.currentStatus}</span>
              </li>
            ))
          ) : (
            <p style={styles.emptyText}>No recent complaints.</p>
          )}
        </ul>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Notifications</h3>
        <ul style={styles.list}>
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <li key={n._id} style={{...styles.listItem, opacity: n.isRead ? 0.6 : 1, display: 'block'}}>
                {n.message}
              </li>
            ))
          ) : (
            <p style={styles.emptyText}>No new notifications.</p>
          )}
        </ul>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Appearance</h3>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={styles.themeToggle}
        >
          {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
    </>
  );
}

// Styles for the sidebar content
const styles = {
    section: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1rem',
    },
    sectionTitleLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
    statCard: {
        background: 'var(--background)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '0.5rem',
    },
    statTitle: {
        color: 'var(--muted)',
        fontSize: '0.8rem',
    },
    statCount: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9rem',
    },
    link: {
        textDecoration: 'none',
        color: 'var(--primary)',
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginRight: '10px',
    },
    statusBadge: {
        background: 'var(--background)',
        padding: '0.25rem 0.5rem',
        borderRadius: '99px',
        fontSize: '0.75rem',
        flexShrink: 0,
    },
    emptyText: {
        fontSize: '0.9rem',
        color: 'var(--muted)',
    },
    themeToggle: {
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        background: 'var(--background)',
        color: 'var(--text)',
        cursor: 'pointer',
        width: '100%',
    }
};
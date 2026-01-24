import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiChartBar, HiClipboardDocumentList, HiFire, HiClock } from 'react-icons/hi2';

export default function OfficialDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, breakdown: {} });
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel fetch: Analytics + Dashboard Feed
      const [analyticsRes, dashboardRes] = await Promise.all([
        fetch('/api/official/analytics', { headers }),
        fetch('/api/official/dashboard', { headers })
      ]);

      const analyticsData = await analyticsRes.json();
      const dashboardDataRes = await dashboardRes.json();

      if (analyticsRes.ok) {
        setStats(analyticsData.data);
      }

      if (dashboardRes.ok) {
        setDashboardData(dashboardDataRes.data);
      } else {
        throw new Error(dashboardDataRes.message || 'Failed to fetch dashboard');
      }

    } catch (err) {
      console.error("Error fetching official data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLevel = (score) => {
    if (score >= 80) return { label: 'Urgent', color: '#dc2626', bg: '#fee2e2' };
    if (score >= 50) return { label: 'High', color: '#ea580c', bg: '#ffedd5' };
    return { label: 'Normal', color: '#2563eb', bg: '#dbeafe' };
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div><p>Loading your dashboard...</p></div>;
  if (error) return <div style={{ ...styles.message, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Official Dashboard</h2>
          <p style={styles.subtitle}>{user?.department || 'Department'} Overview</p>
        </div>
        <Link to="/official/analytics">
          <button style={styles.secondaryBtn}>
            <HiChartBar style={{ marginRight: '6px' }} /> Analytics
          </button>
        </Link>
      </div>

      {/* Stats Row */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Active" value={stats.total || 0} color="#2563eb" />
        <StatCard title="Pending" value={stats.breakdown?.Pending || 0} color="#ef4444" />
        <StatCard title="In Progress" value={stats.breakdown?.['In Progress'] || 0} color="#f59e0b" />
        <StatCard title="Resolved" value={stats.breakdown?.Resolved || 0} color="#16a34a" />
      </div>

      {/* Priority Feed */}
      <div style={styles.feedSection}>
        <h3 style={styles.sectionTitle}>
          <HiFire style={{ color: '#ef4444', marginRight: '8px' }} />
          Priority Task List
        </h3>
        <p style={styles.sectionDesc}>Sorted by urgency score (Upvotes + Age)</p>

        <div style={styles.list}>
          {dashboardData.length > 0 ? (
            dashboardData.map(complaint => {
              const priority = getPriorityLevel(complaint.priorityScore);
              return (
                <Link key={complaint._id} to={`/official/complaint/${complaint._id}`} style={{ textDecoration: 'none' }}>
                  <div style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={styles.idBadge}>#{complaint._id.slice(-6)}</div>
                      <div style={{ ...styles.priorityBadge, color: priority.color, background: priority.bg }}>
                        {priority.label} • {complaint.priorityScore}
                      </div>
                    </div>
                    <h4 style={styles.cardTitle}>{complaint.title}</h4>
                    <div style={styles.cardMeta}>
                      <span>📍 {complaint.location?.address?.split(',')[0]}</span>
                      <span><HiClock style={{ verticalAlign: 'middle' }} /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.cardFooter}>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{complaint.currentStatus}</span>
                      <span style={styles.metric}>👍 {complaint.upvoteCount} votes</span>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div style={styles.emptyState}>
              <p>No active complaints assigned to your department.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <p style={styles.statLabel}>{title}</p>
    <h2 style={{ ...styles.statValue, color }}>{value}</h2>
  </div>
);

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px", minHeight: "100vh", background: "var(--bg)" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "100px", gap: "16px" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" },
  message: { textAlign: 'center', marginTop: '40px', fontSize: '18px', color: 'var(--muted)' },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "700", color: "var(--text)", margin: 0 },
  subtitle: { fontSize: "16px", color: "var(--muted)", margin: "4px 0 0 0" },
  secondaryBtn: { display: "flex", alignItems: "center", padding: "10px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--text)", fontWeight: "500", boxShadow: "var(--shadow-sm)" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" },
  statCard: { background: "var(--card)", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow-sm)", textAlign: "center" },
  statLabel: { fontSize: "14px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" },
  statValue: { fontSize: "32px", fontWeight: "700", margin: 0, color: "var(--text)" },

  feedSection: { background: "var(--card)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" },
  sectionTitle: { fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", margin: "0 0 8px 0", color: "var(--text)" },
  sectionDesc: { fontSize: "14px", color: "var(--muted)", marginBottom: "24px" },

  list: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" },
  emptyState: { gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--muted)", fontStyle: "italic" },

  card: { background: "var(--bg-secondary)", borderRadius: "12px", padding: "16px", border: "1px solid transparent", transition: "all 0.2s", cursor: "pointer", display: "flex", flexDirection: "column", height: "100%" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "12px" },
  idBadge: { fontFamily: "monospace", fontSize: "12px", color: "var(--muted)", background: "rgba(0,0,0,0.05)", padding: "4px 8px", borderRadius: "4px" },
  priorityBadge: { fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "20px", textTransform: "uppercase" },
  cardTitle: { fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0", lineHeight: "1.4", flex: 1, color: "var(--text)" },
  cardMeta: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--muted)", marginBottom: "16px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border)", fontSize: "13px" },
  metric: { fontWeight: "500", color: "var(--text)" }
};
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function OfficialDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [highPriorityComplaints, setHighPriorityComplaints] = useState([]);
  const [pendingByCategoryComplaints, setPendingByCategoryComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Summary
      const summaryRes = await fetch('/api/complaints/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        setSummary(summaryData);
      } else {
        throw new Error(summaryData.message || 'Failed to fetch summary');
      }

      // Fetch High Priority Complaints (e.g., status 'SUBMITTED' or 'IN_PROGRESS')
      const highPriorityRes = await fetch('/api/complaints?status=SUBMITTED', { // Assuming 'SUBMITTED' implies high priority for now
        headers: { Authorization: `Bearer ${token}` },
      });
      const highPriorityData = await highPriorityRes.json();
      if (highPriorityRes.ok) {
        setHighPriorityComplaints(highPriorityData.slice(0, 3)); // Limit to top 3 for dashboard
      } else {
        throw new Error(highPriorityData.message || 'Failed to fetch high priority complaints');
      }

      // Fetch Pending by Category Complaints (e.g., status 'SUBMITTED')
      const pendingByCategoryRes = await fetch('/api/complaints?status=SUBMITTED', { // Reusing for simplicity, can add category filter
        headers: { Authorization: `Bearer ${token}` },
      });
      const pendingByCategoryData = await pendingByCategoryRes.json();
      if (pendingByCategoryRes.ok) {
        setPendingByCategoryComplaints(pendingByCategoryData.slice(0, 3)); // Limit to top 3
      } else {
        throw new Error(pendingByCategoryData.message || 'Failed to fetch pending by category complaints');
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.message}>Loading dashboard...</div>;
  if (error) return <div style={{ ...styles.message, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Officer Dashboard</h2>
        <Link to="/official/analytics">
          <button style={styles.secondaryBtn}>📊 View Analytics</button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Complaints" value={summary.total} color="#2563eb" />
        <StatCard title="Pending" value={summary.pending} color="#ef4444" />
        <StatCard title="In Progress" value={summary.inProgress} color="#f59e0b" />
        <StatCard title="Resolved" value={summary.resolved} color="#16a34a" />
      </div>

      {/* Priority View */}
      <h3 style={styles.sectionTitle}>🔥 High Priority / Urgent</h3>
      <div style={styles.list}>
        {highPriorityComplaints.length > 0 ? (
          highPriorityComplaints.map(complaint => (
            <ComplaintCard key={complaint._id} id={complaint._id} title={complaint.title} category={complaint.category} priority="Urgent" status={complaint.currentStatus} />
          ))
        ) : (
          <p style={styles.message}>No high priority complaints.</p>
        )}
      </div>

      {/* Category View */}
      <h3 style={styles.sectionTitle}>📋 Pending by Category</h3>
      <div style={styles.list}>
        {pendingByCategoryComplaints.length > 0 ? (
          pendingByCategoryComplaints.map(complaint => (
            <ComplaintCard key={complaint._id} id={complaint._id} title={complaint.title} category={complaint.category} priority="Normal" status={complaint.currentStatus} />
          ))
        ) : (
          <p style={styles.message}>No pending complaints by category.</p>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ title, value, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <p style={styles.muted}>{title}</p>
    <h2>{value}</h2>
  </div>
);

const ComplaintCard = ({ id, title, category, priority, status }) => (
  <Link to={`/official/complaint/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.id}>#{id}</span>
        <span style={styles.priority(priority)}>{priority}</span>
      </div>
      <h4>{title}</h4>
      <div style={styles.meta}>
        <span>📂 {category}</span>
        <span style={styles.status}>{status}</span>
      </div>
    </div>
  </Link>
);

const styles = {
  message: { textAlign: 'center', marginTop: '20px' },
  container: { maxWidth: "1000px", margin: "auto", padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  secondaryBtn: { padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--text)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { background: "var(--card)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" },
  muted: { color: "var(--muted)", fontSize: "14px" },
  sectionTitle: { marginTop: "32px", marginBottom: "16px" },
  list: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
  card: { background: "var(--card)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", cursor: "pointer", transition: "transform 0.2s" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  id: { fontSize: "12px", color: "var(--muted)", fontWeight: "bold" },
  priority: (p) => ({
    fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px",
    background: p === "Urgent" ? "#fee2e2" : p === "High" ? "#ffedd5" : "#e0f2fe",
    color: p === "Urgent" ? "#991b1b" : p === "High" ? "#9a3412" : "#075985"
  }),
  meta: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--muted)", marginTop: "12px" },
  status: { fontWeight: "500" }
};
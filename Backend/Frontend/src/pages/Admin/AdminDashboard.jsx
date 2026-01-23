import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalUsers: 0, totalComplaints: 0, pendingApprovals: 0, totalOfficials: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAdminDashboardData();
    }
  }, [user]);

  const fetchAdminDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Summary
      const summaryRes = await fetch('/api/admin/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        setSummary(summaryData);
      } else {
        throw new Error(summaryData.message || 'Failed to fetch summary');
      }

      // Fetch Recent Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        // Sort by creation date and get the latest 5
        const sortedUsers = usersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentUsers(sortedUsers.slice(0, 5));
      } else {
        throw new Error(usersData.message || 'Failed to fetch users');
      }

    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
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
        <h2>Admin Dashboard</h2>
        <div>
          <Link to="/admin/users" style={{ marginRight: '10px' }}>
            <button style={styles.secondaryBtn}>Manage Users</button>
          </Link>
          <Link to="/admin/categories">
            <button style={styles.secondaryBtn}>Manage Categories</button>
          </Link>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard title="Total Users" value={summary.totalUsers} color="#2563eb" />
        <StatCard title="Total Complaints" value={summary.totalComplaints} color="#9333ea" />
        <StatCard title="Pending Approvals" value={summary.pendingApprovals} color="#f59e0b" />
        <StatCard title="Active Officials" value={summary.totalOfficials} color="#16a34a" />
      </div>

      <h3 style={styles.sectionTitle}>Recent User Registrations</h3>
      <div style={styles.listContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.length > 0 ? (
              recentUsers.map(u => (
                <tr key={u._id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>
                    <span style={u.isActive ? styles.active : styles.inactive}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No recent users found.</td>
              </tr>
            )}
          </tbody>
        </table>
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

const styles = {
  message: { textAlign: 'center', marginTop: '20px' },
  container: { maxWidth: "1200px", margin: "auto", padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  secondaryBtn: { padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--text)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { background: "var(--card)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" },
  muted: { color: "var(--muted)", fontSize: "14px" },
  sectionTitle: { marginTop: "32px", marginBottom: "16px" },
  listContainer: { background: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)", overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  td: { padding: '12px 16px', borderBottom: '1px solid var(--border)' },
  active: { color: '#16a34a', fontWeight: '500' },
  inactive: { color: '#ef4444', fontWeight: '500' },
};
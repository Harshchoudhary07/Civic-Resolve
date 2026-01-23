import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function OfficialAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/complaints/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAnalyticsData(data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.message}>Loading analytics...</div>;
  if (error) return <div style={{ ...styles.message, color: 'red' }}>Error: {error}</div>;
  if (!analyticsData) return <div style={styles.message}>No analytics data available.</div>;

  const { complaintVolume, resolutionStatus, slaCompliance, complaintsByCategory } = analyticsData;

  // Prepare data for bar chart (Complaint Volume)
  const volumeLabels = complaintVolume.map(item => `${item._id.month}/${item._id.year}`);
  const volumeCounts = complaintVolume.map(item => item.count);
  const maxVolume = Math.max(...volumeCounts, 1); // Avoid division by zero

  // Prepare data for resolution status
  const resolvedCount = resolutionStatus.find(s => s._id === 'RESOLVED')?.count || 0;
  const pendingCount = resolutionStatus.find(s => s._id === 'SUBMITTED')?.count || 0;
  const inProgressCount = resolutionStatus.find(s => s._id === 'IN_PROGRESS')?.count || 0;
  const rejectedCount = resolutionStatus.find(s => s._id === 'REJECTED')?.count || 0;

  return (
    <div style={styles.container}>
      <h2>Department Analytics</h2>
      <p style={styles.sub}>Performance metrics and SLA compliance.</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Complaint Volume</h3>
          <div style={styles.barChart}>
            {complaintVolume.map((item, index) => (
              <div key={index} style={{...styles.bar, height: `${(item.count / maxVolume) * 100}%`}} title={`${volumeLabels[index]}: ${item.count}`}>
                {volumeLabels[index].split('/')[0]}
              </div>
            ))}
          </div>
          <p style={{textAlign: "center", fontSize: 12, marginTop: 8}}>Monthly Complaints Received</p>
        </div>

        <div style={styles.card}>
          <h3>SLA Compliance</h3>
          <div style={styles.bigStat}>{slaCompliance}%</div>
          <p style={styles.muted}>Complaints resolved within time limit.</p>
          <div style={styles.progressBg}>
            <div style={{...styles.progressBar, width: `${slaCompliance}%`}}></div>
          </div>
        </div>

        <div style={styles.card}>
          <h3>Resolution Status</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}><span>Resolved</span> <span>{resolvedCount}</span></li>
            <li style={styles.listItem}><span>Pending</span> <span>{pendingCount}</span></li>
            <li style={styles.listItem}><span>In Progress</span> <span>{inProgressCount}</span></li>
            <li style={styles.listItem}><span>Rejected</span> <span>{rejectedCount}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  message: { textAlign: 'center', marginTop: '20px' },
  container: { maxWidth: "1000px", margin: "24px auto", padding: "24px" },
  sub: { color: "var(--muted)", marginBottom: "32px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" },
  card: { background: "var(--card)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" },
  barChart: { display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "150px", marginTop: "16px" },
  bar: { width: "30px", background: "var(--primary)", borderRadius: "4px 4px 0 0", opacity: 0.8 },
  bigStat: { fontSize: "48px", fontWeight: "bold", color: "#16a34a", margin: "16px 0" },
  muted: { color: "var(--muted)", fontSize: "14px" },
  progressBg: { height: "8px", background: "var(--border)", borderRadius: "4px", marginTop: "12px" },
  progressBar: { height: "100%", width: "92%", background: "#16a34a", borderRadius: "4px" },
  list: { listStyle: "none", padding: 0, marginTop: "16px" },
  listItem: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "14px" }
};
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
      const res = await fetch('/api/official/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAnalyticsData(data.data);
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

  console.log("Analytics Data:", analyticsData); // Debugging

  const { complaintVolume = [], resolutionStatus = [], slaCompliance = 0, heatmapData = [] } = analyticsData;

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
              <div key={index} style={{ ...styles.bar, height: `${(item.count / maxVolume) * 100}%` }} title={`${volumeLabels[index]}: ${item.count}`}>
                {volumeLabels[index].split('/')[0]}
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12, marginTop: 8 }}>Monthly Complaints Received</p>
        </div>

        <div style={styles.card}>
          <h3>SLA Compliance</h3>
          <div style={styles.bigStat}>{slaCompliance}%</div>
          <p style={styles.muted}>Complaints resolved within time limit.</p>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressBar, width: `${slaCompliance}%` }}></div>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h3>Complaint Density Heatmap</h3>
          <p style={styles.muted}>Relative spatial distribution of active complaints (High Priority = Red)</p>
          <div style={styles.heatmapContainer}>
            {heatmapData && heatmapData.length > 0 ? (
              <HeatmapScatter points={heatmapData} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No geolocation data available.</div>
            )}
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

// Simple Scatter Plot component to mimic a heatmap without external libraries
const HeatmapScatter = ({ points }) => {
  if (!points || !Array.isArray(points)) return null;

  // 1. Find bounds
  const lats = points.map(p => p.lat || 0);
  const lngs = points.map(p => p.lng || 0);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Margin to prevent cutting off dots
  const latStats = maxLat - minLat || 0.01;
  const lngStats = maxLng - minLng || 0.01;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Grid Lines for reference */}
      <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
      <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

      {points.map(p => {
        // Normalize to 0-100%
        // Latitude: Max is TOP (0%), Min is BOTTOM (100%) in CSS usually, but for map logic: Higher Lat is North (Top).
        // So Y = (maxLat - p.lat) / latStats * 100
        const top = ((maxLat - p.lat) / latStats) * 90 + 5; // +5 margin
        const left = ((p.lng - minLng) / lngStats) * 90 + 5;

        // Color based on weight/priority
        const color = p.weight > 80 ? '#ef4444' : p.weight > 50 ? '#f59e0b' : '#3b82f6';

        return (
          <div
            key={p.id}
            title={`${p.title} (Priority: ${p.weight})`}
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${left}%`,
              width: '12px',
              height: '12px',
              background: color,
              borderRadius: '50%',
              boxShadow: `0 0 8px ${color}`,
              opacity: 0.8,
              cursor: 'help'
            }}
          />
        );
      })}
      <div style={{ position: 'absolute', bottom: 8, right: 8, color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>
        Non-geographic logical map
      </div>
    </div>
  );
};

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
  listItem: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "14px" },
  heatmapContainer: { height: "300px", marginTop: "16px", borderRadius: "8px", overflow: "hidden" }
};
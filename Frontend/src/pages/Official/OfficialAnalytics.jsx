import React, { useState, useEffect } from "react";
import { API_URL } from '../config/api';
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FaChartBar, FaClipboardList, FaBolt } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

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
      const res = await fetch(`${API_URL}/api/official/analytics`, {
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

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div><p>Loading analytics...</p></div>;
  if (error) return <div style={{ ...styles.message, color: 'red' }}>Error: {error}</div>;
  if (!analyticsData) return <div style={styles.message}>No analytics data available.</div>;

  const { complaintVolume = [], resolutionStatus = [], slaCompliance = 0, heatmapData = [] } = analyticsData;

  // Convert resolutionStatus to array if it's an object
  let statusArray = [];
  if (Array.isArray(resolutionStatus)) {
    statusArray = resolutionStatus;
  } else if (resolutionStatus && typeof resolutionStatus === 'object') {
    // If it's an object, convert to array
    statusArray = Object.entries(resolutionStatus).map(([key, value]) => ({
      _id: key,
      count: value
    }));
  }

  // Prepare data for charts
  const volumeData = complaintVolume.map(item => ({
    name: `${getMonthName(item._id?.month || item.month)} ${item._id?.year || item.year}`,
    complaints: item.count
  }));

  const statusData = statusArray.map(s => ({
    name: formatStatusName(s._id),
    value: s.count
  })).filter(s => s.value > 0); // Only show statuses with data

  const COLORS = {
    'Resolved': '#16a34a',
    'Pending': '#ef4444',
    'In Progress': '#f59e0b',
    'Rejected': '#991b1b'
  };

  // Custom label renderer for pie chart with better visibility
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="var(--text)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: '600' }}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Department Analytics</h2>
          <p style={styles.subtitle}>{user?.department || 'Department'} Performance Metrics</p>
        </div>
        <button onClick={fetchAnalyticsData} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* SLA Compliance Card */}
      <div style={styles.slaCard}>
        <div style={styles.slaContent}>
          <div>
            <h3 style={styles.slaTitle}>SLA Compliance</h3>
            <p style={styles.slaDesc}>Complaints resolved within 48 hours</p>
          </div>
          <div style={styles.slaScore}>
            <div style={styles.slaNumber}>{slaCompliance}%</div>
            <div style={styles.progressBg}>
              <div style={{ ...styles.progressBar, width: `${slaCompliance}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Complaint Volume Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}><FaChartBar style={{ marginRight: '8px', display: 'inline' }} />Complaint Volume Trend</h3>
          <p style={styles.cardDesc}>Monthly complaints received (Last 6 months)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Bar dataKey="complaints" fill="#FF9933" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Status Pie Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>📈 Resolution Status</h3>
          <p style={styles.cardDesc}>Current complaint distribution</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                itemStyle={{ color: 'var(--text)' }}
                labelStyle={{ color: 'var(--text)', fontWeight: '600' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div style={{ ...styles.chartCard, gridColumn: '1 / -1' }}>
          <h3 style={styles.cardTitle}>🗺️ Complaint Density Heatmap</h3>
          <p style={styles.cardDesc}>Geographic distribution of active complaints</p>
          <div style={styles.heatmapContainer}>
            {heatmapData && heatmapData.length > 0 ? (
              <HeatmapScatter points={heatmapData} />
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}><MdLocationOn /></div>
                <div>No geolocation data available</div>
                <div style={styles.emptyText}>Complaints need location coordinates to appear on the heatmap</div>
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown List */}
        <div style={styles.statsCard}>
          <h3 style={styles.cardTitle}><FaClipboardList style={{ marginRight: '8px', display: 'inline' }} />Detailed Breakdown</h3>
          <div style={styles.statsList}>
            {statusData.map((item, index) => (
              <div key={index} style={styles.statItem}>
                <div style={styles.statLabel}>
                  <div style={{ ...styles.statDot, background: COLORS[item.name] || '#3b82f6' }}></div>
                  {item.name}
                </div>
                <div style={styles.statValue}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsCard}>
          <h3 style={styles.cardTitle}><FaBolt style={{ marginRight: '8px', display: 'inline' }} />Quick Stats</h3>
          <div style={styles.quickStats}>
            <div style={styles.quickStat}>
              <div style={styles.quickStatLabel}>Total Complaints</div>
              <div style={styles.quickStatValue}>
                {statusData.reduce((sum, item) => sum + item.value, 0)}
              </div>
            </div>
            <div style={styles.quickStat}>
              <div style={styles.quickStatLabel}>Resolution Rate</div>
              <div style={styles.quickStatValue}>
                {statusData.length > 0
                  ? Math.round((statusData.find(s => s.name === 'Resolved')?.value || 0) / statusData.reduce((sum, item) => sum + item.value, 0) * 100)
                  : 0}%
              </div>
            </div>
            <div style={styles.quickStat}>
              <div style={styles.quickStatLabel}>Active Cases</div>
              <div style={styles.quickStatValue}>
                {(statusData.find(s => s.name === 'Pending')?.value || 0) +
                  (statusData.find(s => s.name === 'In Progress')?.value || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || month;
};

const formatStatusName = (status) => {
  const statusMap = {
    'RESOLVED': 'Resolved',
    'PENDING': 'Pending',
    'SUBMITTED': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'REJECTED': 'Rejected'
  };
  return statusMap[status] || status;
};

// Heatmap component
const HeatmapScatter = ({ points }) => {
  if (!points || !Array.isArray(points) || points.length === 0) return null;

  const lats = points.map(p => p.lat || 0);
  const lngs = points.map(p => p.lng || 0);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;

  return (
    <div style={styles.heatmapCanvas}>
      <div style={styles.gridLine1}></div>
      <div style={styles.gridLine2}></div>

      {points.map(p => {
        const top = ((maxLat - p.lat) / latRange) * 90 + 5;
        const left = ((p.lng - minLng) / lngRange) * 90 + 5;
        const color = p.weight > 80 ? '#ef4444' : p.weight > 50 ? '#f59e0b' : '#3b82f6';
        const size = Math.max(8, Math.min(16, p.weight / 5));

        return (
          <div
            key={p.id}
            title={`${p.title} (Priority: ${p.weight})`}
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              borderRadius: '50%',
              boxShadow: `0 0 12px ${color}`,
              opacity: 0.85,
              cursor: 'help',
              transition: 'all 0.2s ease'
            }}
          />
        );
      })}

      <div style={styles.heatmapLegend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#ef4444' }}></div>
          <span>High Priority</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#f59e0b' }}></div>
          <span>Medium</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#3b82f6' }}></div>
          <span>Low</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' },
  spinner: { width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  message: { textAlign: 'center', marginTop: '40px', fontSize: '16px', color: 'var(--muted)' },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px", minHeight: "100vh" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: 'var(--text)', margin: 0 },
  subtitle: { color: 'var(--muted)', marginTop: '4px', fontSize: '14px' },
  refreshBtn: { padding: '10px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: 'var(--text)' },

  slaCard: { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' },
  slaContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  slaTitle: { fontSize: '20px', fontWeight: '600', margin: 0 },
  slaDesc: { fontSize: '13px', opacity: 0.9, marginTop: '4px' },
  slaScore: { textAlign: 'right' },
  slaNumber: { fontSize: '48px', fontWeight: '800', lineHeight: '1' },
  progressBg: { height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', marginTop: '12px', width: '200px' },
  progressBar: { height: '100%', background: 'white', borderRadius: '4px', transition: 'width 0.3s ease' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' },
  chartCard: { background: 'var(--card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' },
  statsCard: { background: 'var(--card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px 0' },
  cardDesc: { fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' },

  statsList: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
  statItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' },
  statLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' },
  statDot: { width: '10px', height: '10px', borderRadius: '50%' },
  statValue: { fontSize: '18px', fontWeight: '700', color: 'var(--text)' },

  quickStats: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' },
  quickStat: { padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' },
  quickStatLabel: { fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  quickStatValue: { fontSize: '32px', fontWeight: '700', color: 'var(--text)', marginTop: '8px' },

  heatmapContainer: { height: '400px', marginTop: '16px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)' },
  heatmapCanvas: { position: 'relative', width: '100%', height: '100%', background: '#1e293b', borderRadius: '8px', overflow: 'hidden' },
  gridLine1: { position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' },
  gridLine2: { position: 'absolute', left: '50%', height: '100%', width: '1px', background: 'rgba(255,255,255,0.1)' },
  heatmapLegend: { position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.7)', padding: '8px 12px', borderRadius: '6px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'white' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%' },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '12px', marginTop: '4px' }
};
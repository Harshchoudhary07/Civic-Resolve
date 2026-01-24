import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

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
  const { socket, connected } = useSocket();
  const { user } = useAuth();



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

  // Listen for real-time new complaints via Socket.IO
  useEffect(() => {
    if (socket && connected && user) {
      // Listen for new complaints (for citizens to see their own new complaints)
      socket.on('new-complaint', (complaint) => {
        console.log('🆕 New complaint received in sidebar:', complaint);
        
        // Add to recent complaints list
        setRecentComplaints(prev => [complaint, ...prev].slice(0, 5));
        
        // Update summary counts
        setSummary(prev => ({
          ...prev,
          open: prev.open + 1
        }));
      });

      // Listen for complaint updates
      socket.on('complaint-update', ({ complaintId, update }) => {
        console.log('🔄 Complaint updated:', complaintId, update);
        
        // Update the complaint in recent list if it exists
        setRecentComplaints(prev => 
          prev.map(c => 
            c._id === complaintId 
              ? { ...c, currentStatus: update.status }
              : c
          )
        );
      });

      return () => {
        socket.off('new-complaint');
        socket.off('complaint-update');
      };
    }
  }, [socket, connected, user]);

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
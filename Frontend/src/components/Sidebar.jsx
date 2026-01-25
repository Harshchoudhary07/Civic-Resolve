import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash } from 'react-icons/fa';
import { API_URL } from '../config/api';

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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { socket, connected } = useSocket();
  const { user } = useAuth();



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

      try {
        const [summaryRes, recentRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/api/citizen/dashboard`, { headers }),
          fetch(`${API_URL}/api/citizen/complaints/recent`, { headers }),
          fetch(`${API_URL}/api/citizen/notifications`, { headers }),
        ]);

        // Only parse JSON if response is OK
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          if (summaryData.success) setSummary(summaryData.summary);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          if (recentData.success) setRecentComplaints(recentData.complaints);
        }

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (notifData.success) setNotifications(notifData.notifications);
        } else {
          console.log('Failed to fetch notifications:', notifRes.status);
        }
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

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/complaints/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();

      if (res.ok) {
        // Remove from sidebar
        setRecentComplaints(prev => prev.filter(c => c._id !== id));
        setDeleteConfirm(null);

        // Update summary counts
        setSummary(prev => ({
          ...prev,
          open: Math.max(0, prev.open - 1)
        }));

        // Trigger page reload to update feed and other components
        window.location.reload();
      } else {
        alert(data.message || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Error deleting complaint');
    } finally {
      setDeleting(false);
    }
  };

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.statusBadge}>{c.currentStatus}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteConfirm(c._id);
                    }}
                    style={styles.deleteBtn}
                    title="Delete complaint"
                  >
                    <FaTrash />
                  </button>
                </div>
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
              <li key={n._id} style={{ ...styles.listItem, opacity: n.isRead ? 0.6 : 1, display: 'block' }}>
                {n.message}
              </li>
            ))
          ) : (
            <p style={styles.emptyText}>No new notifications.</p>
          )}
        </ul>
      </div>

      {/* User Profile at Bottom */}
      <div style={styles.profileBottom}>
        <div style={styles.profileBottomAvatar}>{user?.name?.charAt(0)}</div>
        <div style={styles.profileBottomInfo}>
          <div style={styles.profileBottomName}>{user?.name}</div>
          <div style={styles.profileBottomRole}>{user?.role?.toUpperCase()}</div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Complaint?</h3>
            <p style={styles.modalText}>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={styles.modalCancelButton}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={styles.modalDeleteButton}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  },
  deleteBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'var(--card)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '12px',
  },
  modalText: {
    fontSize: '14px',
    color: 'var(--muted)',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  modalDeleteButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#ef4444',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },

  // Profile Bottom Styles
  profileBottom: {
    marginTop: 'auto',
    padding: '16px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--card)',
  },
  profileBottomAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
  },
  profileBottomInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileBottomName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  profileBottomRole: {
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

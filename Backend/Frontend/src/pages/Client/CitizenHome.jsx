import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import FeedCard from '../../components/FeedCard';

export default function CitizenHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [statsRes, feedRes] = await Promise.all([
        fetch('/api/citizen/dashboard', { headers }),
        fetch('/api/feed?limit=20', { headers })
      ]);

      const statsData = await statsRes.json();
      const feedData = await feedRes.json();

      if (statsData.success) {
        setStats({
          total: (statsData.summary.open || 0) + (statsData.summary.inProgress || 0) + (statsData.summary.resolved || 0),
          open: statsData.summary.open || 0,
          inProgress: statsData.summary.inProgress || 0,
          resolved: statsData.summary.resolved || 0
        });
      }
      if (feedData) { // Assuming feed API returns array directly
        setFeed(feedData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleUpvote = async (complaintId) => {
    try {
      const res = await fetch(`/api/feed/${complaintId}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();

      // Update local state
      setFeed(prevFeed => prevFeed.map(item =>
        item._id === complaintId
          ? { ...item, upvoteCount: data.upvoteCount }
          : item
      ));
    } catch (error) {
      console.error('Failed to upvote', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.layoutGrid}>

        {/* Left Column: Feed */}
        <div style={styles.mainColumn}>
          <div style={styles.feedHeader}>
            <h2 style={styles.pageTitle}>Community Feed</h2>
            <div style={styles.feedFilters}>
              <button style={styles.activeFilter}>🔥 Priority</button>
              <button style={styles.inactiveFilter}>✨ Newest</button>
            </div>
          </div>

          <div style={styles.createPostCard}>
            <div style={styles.createPostHeader}>
              <div style={styles.userAvatarPlaceholder}>{user?.name?.charAt(0) || 'U'}</div>
              <Link to="/citizen/file-complaint" style={styles.fakeInput}>
                What issue are you facing today, {user?.name?.split(' ')[0]}?
              </Link>
            </div>
            <div style={styles.createPostActions}>
              <Link to="/citizen/file-complaint" style={styles.createAction}>📷 Photo</Link>
              <Link to="/citizen/file-complaint" style={styles.createAction}>📍 Location</Link>
            </div>
          </div>

          <div style={styles.feedList}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading your neighborhood updates...</p>
              </div>
            ) : feed.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🌍</div>
                <div style={styles.emptyTitle}>Your feed is empty</div>
                <div style={styles.emptyText}>Be the first to create a post for your community!</div>
                <Link to="/citizen/file-complaint" style={styles.primaryButton}>
                  Start a Topic
                </Link>
              </div>
            ) : (
              feed.map((complaint) => (
                <FeedCard
                  key={complaint._id}
                  complaint={complaint}
                  onUpvote={handleUpvote}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div style={styles.sidebarColumn}>

          {/* User Profile Card */}
          <div style={styles.sidebarCard}>
            <div style={styles.miniProfile}>
              <div style={styles.miniAvatar}>{user?.name?.charAt(0)}</div>
              <div>
                <div style={styles.miniName}>{user?.name}</div>
                <div style={styles.miniRole}>Citizen</div>
              </div>
            </div>
            <div style={styles.miniStatsRow}>
              <div style={styles.miniStat}>
                <span style={styles.miniStatValue}>{stats.total}</span>
                <span style={styles.miniStatLabel}>Posts</span>
              </div>
              <div style={styles.miniStat}>
                <span style={styles.miniStatValue}>{stats.resolved}</span>
                <span style={styles.miniStatLabel}>Resolved</span>
              </div>
            </div>
            <Link to="/citizen/profile" style={styles.outlinedButton}>View Profile</Link>
          </div>

          {/* Quick Actions */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.sidebarLinks}>
              <Link to="/citizen/file-complaint" style={styles.sidebarLink}>
                <span>📝</span> File New Complaint
              </Link>
              <Link to="/citizen/my-complaints" style={styles.sidebarLink}>
                <span>📋</span> My History
              </Link>
              <a href="#help" style={styles.sidebarLink}>
                <span>❓</span> Help Center
              </a>
            </div>
          </div>

          {/* Announcements */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>📢 Announcements</h3>
            <div style={styles.miniAnnouncement}>
              <div style={styles.miniAnnounceTitle}>Live Evidence Upload</div>
              <div style={styles.miniAnnounceText}>Capture photos directly in app.</div>
            </div>
            <div style={styles.miniAnnouncement}>
              <div style={styles.miniAnnounceTitle}>Faster Resolutions</div>
              <div style={styles.miniAnnounceText}>Avg time down to 5 days.</div>
            </div>
          </div>

        </div>
      </div>
    </div >
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
    minHeight: "100vh"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px", // Main content + Sidebar
    gap: "24px",
    "@media (max-width: 800px)": { // Simple responsive check (conceptual)
      gridTemplateColumns: "1fr"
    }
  },
  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  sidebarColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  // Feed Header
  feedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--text)",
    margin: 0
  },
  feedFilters: {
    display: "flex",
    gap: "8px",
    background: "var(--card)",
    padding: "4px",
    borderRadius: "8px",
    border: "1px solid var(--border)"
  },
  activeFilter: {
    background: "var(--bg-secondary)",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--primary)",
    cursor: "pointer"
  },
  inactiveFilter: {
    background: "transparent",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    color: "var(--muted)",
    cursor: "pointer"
  },

  // Create Post Input (Visual only)
  createPostCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "var(--shadow-sm)"
  },
  createPostHeader: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    alignItems: "center"
  },
  userAvatarPlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--primary)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600"
  },
  fakeInput: {
    flex: 1,
    background: "var(--bg-secondary)",
    padding: "10px 16px",
    borderRadius: "20px",
    color: "var(--muted)",
    textDecoration: "none",
    fontSize: "14px",
    cursor: "text"
  },
  createPostActions: {
    display: "flex",
    gap: "20px",
    paddingTop: "12px",
    borderTop: "1px solid var(--border)"
  },
  createAction: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--muted)",
    textDecoration: "none"
  },

  // Feed List
  feedList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
    color: "var(--muted)"
  },
  emptyState: {
    background: "var(--card)",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid var(--border)"
  },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" },
  emptyText: { color: "var(--muted)", marginBottom: "20px" },
  primaryButton: {
    display: "inline-block",
    padding: "10px 20px",
    background: "var(--primary)",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px"
  },

  // Sidebar Components
  sidebarCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "var(--shadow-sm)"
  },
  miniProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px"
  },
  miniAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--primary), #3b82f6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px"
  },
  miniName: {
    fontWeight: "700",
    color: "var(--text)",
    fontSize: "16px"
  },
  miniRole: {
    fontSize: "12px",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  miniStatsRow: {
    display: "flex",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)",
    padding: "12px 0",
    marginBottom: "16px"
  },
  miniStat: {
    flex: 1,
    textAlign: "center",
    borderRight: "1px solid var(--border)",
    "&:last-child": { borderRight: "none" }
  },
  miniStatValue: {
    display: "block",
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--text)"
  },
  miniStatLabel: {
    fontSize: "11px",
    color: "var(--muted)",
    textTransform: "uppercase"
  },
  outlinedButton: {
    display: "block",
    width: "100%",
    padding: "8px",
    textAlign: "center",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background 0.2s"
  },
  sidebarTitle: {
    fontSize: "15px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "var(--text)"
  },
  sidebarLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  sidebarLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "8px",
    color: "var(--text)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.2s",
    ":hover": { background: "var(--bg-secondary)" }
  },
  miniAnnouncement: {
    padding: "12px",
    background: "var(--bg-secondary)",
    borderRadius: "8px",
    marginBottom: "12px",
    "&:last-child": { marginBottom: 0 }
  },
  miniAnnounceTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text)",
    marginBottom: "4px"
  },
  miniAnnounceText: {
    fontSize: "12px",
    color: "var(--muted)",
    lineHeight: "1.4"
  }
};
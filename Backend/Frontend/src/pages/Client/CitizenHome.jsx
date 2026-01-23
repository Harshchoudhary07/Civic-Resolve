import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  HiHandRaised, 
  HiDocumentText, 
  HiChartBar, 
  HiExclamationCircle, 
  HiClock, 
  HiCheckCircle, 
  HiClipboardDocumentList, 
  HiUser, 
  HiQuestionMarkCircle, 
  HiInboxArrowDown, 
  HiFolder, 
  HiCalendar, 
  HiPhone, 
  HiEnvelope, 
  HiMegaphone, 
  HiSparkles, 
  HiBolt 
} from 'react-icons/hi2';

export default function CitizenHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [statsRes, recentRes] = await Promise.all([
        fetch('/api/citizen/dashboard', { headers }),
        fetch('/api/citizen/complaints/recent', { headers })
      ]);

      const statsData = await statsRes.json();
      const recentData = await recentRes.json();

      if (statsData.success) {
        setStats({
          total: (statsData.summary.open || 0) + (statsData.summary.inProgress || 0) + (statsData.summary.resolved || 0),
          open: statsData.summary.open || 0,
          inProgress: statsData.summary.inProgress || 0,
          resolved: statsData.summary.resolved || 0
        });
      }
      if (recentData.success) {
        setRecentComplaints(recentData.complaints.slice(0, 5));
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

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <div style={styles.welcomeSection}>
        <div>
          <h1 style={styles.greeting}>{getGreeting()}, {user?.name || 'Citizen'}! <HiHandRaised style={{ display: 'inline' }} /></h1>
          <p style={styles.welcomeText}>Track your complaints and stay updated on resolutions</p>
        </div>
        <Link to="/citizen/file-complaint" style={styles.primaryButton}>
          <span style={styles.buttonIcon}><HiDocumentText /></span>
          File New Complaint
        </Link>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statCardTotal }}>
          <div style={styles.statIcon}><HiChartBar /></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{loading ? '...' : stats.total}</div>
            <div style={styles.statLabel}>Total Complaints</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardOpen }}>
          <div style={styles.statIcon}><HiExclamationCircle style={{color: '#ef4444'}} /></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{loading ? '...' : stats.open}</div>
            <div style={styles.statLabel}>Open</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardProgress }}>
          <div style={styles.statIcon}><HiClock style={{color: '#3b82f6'}} /></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{loading ? '...' : stats.inProgress}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardResolved }}>
          <div style={styles.statIcon}><HiCheckCircle /></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{loading ? '...' : stats.resolved}</div>
            <div style={styles.statLabel}>Resolved</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickActionsGrid}>
          <Link to="/citizen/file-complaint" style={styles.actionCard}>
            <div style={styles.actionIcon}><HiDocumentText /></div>
            <div style={styles.actionTitle}>File Complaint</div>
            <div style={styles.actionDesc}>Report a new issue</div>
          </Link>
          <Link to="/citizen/my-complaints" style={styles.actionCard}>
            <div style={styles.actionIcon}><HiClipboardDocumentList /></div>
            <div style={styles.actionTitle}>My Complaints</div>
            <div style={styles.actionDesc}>View all complaints</div>
          </Link>
          <Link to="/citizen/profile" style={styles.actionCard}>
            <div style={styles.actionIcon}><HiUser /></div>
            <div style={styles.actionTitle}>Profile</div>
            <div style={styles.actionDesc}>Update your details</div>
          </Link>
          <a href="#help" style={styles.actionCard}>
            <div style={styles.actionIcon}><HiQuestionMarkCircle /></div>
            <div style={styles.actionTitle}>Help & FAQ</div>
            <div style={styles.actionDesc}>Get assistance</div>
          </a>
        </div>
      </div>

      <div style={styles.twoColumnGrid}>
        {/* Recent Complaints */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Complaints</h2>
            <Link to="/citizen/my-complaints" style={styles.viewAllLink}>View All →</Link>
          </div>
          <div style={styles.recentList}>
            {loading ? (
              <div style={styles.loadingText}>Loading...</div>
            ) : recentComplaints.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}><HiInboxArrowDown /></div>
                <div style={styles.emptyTitle}>No complaints yet</div>
                <div style={styles.emptyText}>File your first complaint to get started</div>
                <Link to="/citizen/file-complaint" style={styles.emptyButton}>
                  File Complaint
                </Link>
              </div>
            ) : (
              recentComplaints.map((complaint) => (
                <Link key={complaint._id} to={`/citizen/complaint/${complaint._id}`} style={styles.recentItem}>
                  <div style={styles.recentItemHeader}>
                    <span style={styles.recentItemTitle}>{complaint.title}</span>
                    <span style={getStatusStyle(complaint.currentStatus)}>{complaint.currentStatus}</span>
                  </div>
                  <div style={styles.recentItemMeta}>
                    <span><HiFolder style={{display: 'inline', marginRight: '4px'}} />{complaint.category}</span>
                    <span><HiCalendar style={{display: 'inline', marginRight: '4px'}} />{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Announcements & Resources */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}><HiMegaphone style={{display: 'inline', marginRight: '8px'}} />Announcements</h2>
          <div style={styles.announcementList}>
            <div style={styles.announcementItem}>
              <div style={styles.announcementIcon}><HiSparkles /></div>
              <div>
                <div style={styles.announcementTitle}>New Feature: Live Evidence Upload</div>
                <div style={styles.announcementText}>You can now capture photos and videos directly while filing complaints</div>
                <div style={styles.announcementDate}>2 days ago</div>
              </div>
            </div>
            <div style={styles.announcementItem}>
              <div style={styles.announcementIcon}><HiBolt /></div>
              <div>
                <div style={styles.announcementTitle}>Faster Response Times</div>
                <div style={styles.announcementText}>Average resolution time reduced to 5 days</div>
                <div style={styles.announcementDate}>1 week ago</div>
              </div>
            </div>
          </div>

          <div style={styles.helpSection}>
            <h3 style={styles.helpTitle}>Need Assistance?</h3>
            <div style={styles.helpContent}>
              <div style={styles.helpItem}>
                <span style={styles.helpIcon}><HiPhone /></span>
                <div>
                  <div style={styles.helpLabel}>Helpline</div>
                  <div style={styles.helpValue}>1800-XXX-XXXX</div>
                </div>
              </div>
              <div style={styles.helpItem}>
                <span style={styles.helpIcon}><HiEnvelope /></span>
                <div>
                  <div style={styles.helpLabel}>Email Support</div>
                  <div style={styles.helpValue}>support@civicresolve.gov.in</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const getStatusStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: "600",
  background:
    status === "Resolved" ? "#dcfce7" :
      status === "In Progress" ? "#dbeafe" :
        status === "Pending" ? "#fef3c7" : "#fee2e2",
  color:
    status === "Resolved" ? "#166534" :
      status === "In Progress" ? "#1e40af" :
        status === "Pending" ? "#b45309" : "#991b1b",
});

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "24px"
  },
  welcomeSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px"
  },
  greeting: {
    fontSize: "32px",
    fontWeight: "700",
    color: "var(--text)",
    margin: "0 0 8px 0"
  },
  welcomeText: {
    color: "var(--muted)",
    fontSize: "16px",
    margin: 0
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "var(--primary)",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.2s ease"
  },
  buttonIcon: {
    fontSize: "18px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "40px"
  },
  statCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "var(--shadow-sm)",
    transition: "transform 0.2s ease"
  },
  statCardTotal: {
    borderLeft: "4px solid var(--primary)"
  },
  statCardOpen: {
    borderLeft: "4px solid #f97316"
  },
  statCardProgress: {
    borderLeft: "4px solid #3b82f6"
  },
  statCardResolved: {
    borderLeft: "4px solid #22c55e"
  },
  statIcon: {
    fontSize: "36px",
    lineHeight: 1
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "var(--text)",
    lineHeight: 1,
    marginBottom: "4px"
  },
  statLabel: {
    fontSize: "14px",
    color: "var(--muted)",
    fontWeight: "500"
  },
  section: {
    marginBottom: "40px"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--text)",
    margin: "0 0 20px 0"
  },
  viewAllLink: {
    color: "var(--primary)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500"
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px"
  },
  actionCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.2s ease",
    cursor: "pointer"
  },
  actionIcon: {
    fontSize: "40px",
    marginBottom: "12px"
  },
  actionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text)",
    marginBottom: "4px"
  },
  actionDesc: {
    fontSize: "13px",
    color: "var(--muted)"
  },
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr"
    }
  },
  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  recentItem: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "16px",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.2s ease"
  },
  recentItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    gap: "12px"
  },
  recentItemTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text)",
    flex: 1
  },
  recentItemMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "var(--muted)"
  },
  loadingText: {
    textAlign: "center",
    color: "var(--muted)",
    padding: "40px"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px"
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px"
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text)",
    marginBottom: "8px"
  },
  emptyText: {
    fontSize: "14px",
    color: "var(--muted)",
    marginBottom: "20px"
  },
  emptyButton: {
    display: "inline-block",
    padding: "10px 20px",
    background: "var(--primary)",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px"
  },
  announcementList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "24px"
  },
  announcementItem: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    gap: "12px"
  },
  announcementIcon: {
    fontSize: "24px",
    lineHeight: 1
  },
  announcementTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text)",
    marginBottom: "4px"
  },
  announcementText: {
    fontSize: "13px",
    color: "var(--muted)",
    marginBottom: "6px",
    lineHeight: "1.5"
  },
  announcementDate: {
    fontSize: "12px",
    color: "var(--muted)",
    opacity: 0.7
  },
  helpSection: {
    background: "linear-gradient(135deg, var(--primary), var(--gov-blue-dark))",
    color: "white",
    padding: "24px",
    borderRadius: "12px"
  },
  helpTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 16px 0"
  },
  helpContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  helpItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start"
  },
  helpIcon: {
    fontSize: "24px",
    lineHeight: 1
  },
  helpLabel: {
    fontSize: "12px",
    opacity: 0.9,
    marginBottom: "2px"
  },
  helpValue: {
    fontSize: "14px",
    fontWeight: "600"
  }
};
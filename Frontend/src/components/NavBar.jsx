import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { API_URL } from '../config/api';
import { HiDocumentText, HiBell } from 'react-icons/hi2';
import { FaLandmark, FaUser, FaKey, FaDoorOpen } from 'react-icons/fa';
import GiveFeedbackModal from './GiveFeedbackModal'; // Add import

export const NavBar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Add unreadCount state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (socket && connected) {
      // Listen for new notifications
      socket.on('notification', (notification) => {
        console.log('📢 New notification received:', notification);

        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);

        // Only increment unread count if notification is unread
        if (!notification.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, connected]);

  const fetchNotifications = async () => {
    try {
      const endpoint = user.role === 'citizen'
        ? `${API_URL}/api/citizen/notifications`
        : `${API_URL}/api/official/notifications`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const endpoint = user.role === 'citizen'
        ? `${API_URL}/api/citizen/notifications/${notificationId}/read`
        : `${API_URL}/api/official/notifications/${notificationId}/read`;

      await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.isRead);

      if (unreadNotifications.length === 0) return;

      // Use bulk endpoint for better performance
      const endpoint = user.role === 'citizen'
        ? `${API_URL}/api/citizen/notifications/mark-all-read`
        : `${API_URL}/api/official/notifications/mark-all-read`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        // Update local state immediately
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        console.log(`✅ Marked all notifications as read`);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);

    // Mark all as read when opening the dropdown
    if (!showNotifications && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout(navigate);
  };

  return (
    <>
      <nav style={styles.nav}>
        {/* Government Logo & App Name */}
        <div style={styles.logoSection} onClick={() => navigate("/")}>
          <div style={styles.emblem}><FaLandmark /></div>
          <div style={styles.logoText}>
            <div style={styles.appName}>CivicResolve</div>
            <div style={styles.tagline}>Complaint Portal</div>
          </div>
        </div>

        {/* Navigation Buttons - Reorganized: Notification → Profile → Logout → Theme */}
        <div style={styles.actions}>
          {user ? (
            <>
              {/* {user.role === 'citizen' && (
                <button onClick={() => navigate("/citizen/file-complaint")} className="btn-gradient-cta" style={styles.fileBtn}>
                  <HiDocumentText style={{ display: 'inline', marginRight: '4px', fontSize: '1.1em', verticalAlign: 'text-bottom' }} />File Complaint
                </button>
              )} */}

              {/* Notification Bell */}
              <div style={styles.notificationContainer}>
                <button
                  onClick={handleNotificationClick}
                  style={styles.notificationBtn}
                  title="Notifications"
                >
                  <HiBell style={{ fontSize: '1.25rem' }} />
                  {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div style={styles.notificationDropdown}>
                    <div style={styles.notificationHeader}>
                      <h4 style={styles.notificationTitle}>Notifications</h4>
                      <span style={styles.notificationCount}>{unreadCount} unread</span>
                    </div>
                    <div style={styles.notificationList}>
                      {notifications.length === 0 ? (
                        <div style={styles.emptyNotifications}>No notifications</div>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <div
                            key={notif._id}
                            style={{
                              ...styles.notificationItem,
                              background: notif.isRead ? 'transparent' : 'var(--bg-secondary)'
                            }}
                            onClick={() => {
                              markAsRead(notif._id);
                              if (notif.complaint) {
                                navigate(`/${user.role}/complaint/${notif.complaint}`);
                                setShowNotifications(false);
                              }
                            }}
                          >
                            <div style={styles.notificationMessage}>{notif.message}</div>
                            <div style={styles.notificationTime}>
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={styles.themeToggle}
                title="Toggle theme"
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </button>

              {/* Profile Dropdown - Rightmost */}
              <div
                style={styles.profileDropdownContainer}
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <div style={styles.profileContainer}>
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt="Profile"
                    style={styles.profileImage}
                  />
                </div>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div style={styles.profileDropdown}>
                    <div style={styles.profileDropdownHeader}>
                      <div style={styles.profileDropdownName}>{user.name}</div>
                      <div style={styles.profileDropdownEmail}>{user.email}</div>
                    </div>
                    <div style={styles.profileDropdownDivider}></div>
                    <button
                      onClick={() => {
                        navigate(`/${user.role}/profile`);
                        setShowProfileDropdown(false);
                      }}
                      style={styles.profileDropdownItem}
                    >
                      <FaUser style={{ marginRight: '8px' }} />View Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/${user.role}/change-password`);
                        setShowProfileDropdown(false);
                      }}
                      style={styles.profileDropdownItem}
                    >
                      <FaKey style={{ marginRight: '8px' }} />Change Password
                    </button>
                    <div style={styles.profileDropdownDivider}></div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowLogoutModal(true);
                      }}
                      style={{ ...styles.profileDropdownItem, ...styles.profileDropdownLogout }}
                    >
                      <FaDoorOpen style={{ marginRight: '8px' }} />Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={() => navigate("/citizen/login")} className="btn-gradient-primary" style={styles.loginBtn}>Login</button>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Confirm Logout</h3>
            <p style={styles.modalText}>Are you sure you want to log out of your account?</p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowLogoutModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleLogout} style={styles.confirmBtn}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  nav: {
    height: "70px",
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "var(--card)",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "var(--shadow-sm)",
    transition: "background 0.3s ease",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },

  emblem: {
    width: "45px",
    height: "45px",
    background: "linear-gradient(135deg, var(--gov-blue) 0%, var(--gov-blue-light) 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    boxShadow: "var(--shadow-sm)",
  },

  logoText: {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
  },

  appName: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text)",
    lineHeight: 1,
  },

  tagline: {
    fontSize: "0.6875rem",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "500",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  fileBtn: {
    padding: "0.625rem 1.25rem",
    borderRadius: "8px",
    background: "linear-gradient(135deg, var(--gov-saffron) 0%, var(--gov-orange) 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: "600",
    boxShadow: "var(--shadow-sm)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
  },

  logoutBtn: {
    padding: "0.625rem 1rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },

  loginBtn: {
    padding: "0.625rem 1.5rem",
    borderRadius: "8px",
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: "600",
    boxShadow: "var(--shadow-sm)",
    transition: "all 0.2s ease",
  },

  profileContainer: {
    cursor: 'pointer',
    transition: "transform 0.2s ease",
  },

  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--primary)',
    boxShadow: "var(--shadow-sm)",
  },

  themeToggle: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    cursor: 'pointer',
    fontSize: '1.125rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: "all 0.2s ease",
  },

  // Notification Styles
  notificationContainer: {
    position: 'relative',
  },
  notificationBtn: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: "all 0.2s ease",
    color: 'var(--text)',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    minWidth: '18px',
    textAlign: 'center',
  },
  notificationDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '360px',
    maxHeight: '500px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  notificationHeader: {
    padding: '16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text)',
  },
  notificationCount: {
    fontSize: '12px',
    color: 'var(--muted)',
    background: 'var(--bg-secondary)',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  notificationList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  notificationItem: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': {
      background: 'var(--bg-secondary)',
    },
  },
  notificationMessage: {
    fontSize: '14px',
    color: 'var(--text)',
    marginBottom: '4px',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
  emptyNotifications: {
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--muted)',
    fontSize: '14px',
  },

  // Modal Styles
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    background: "var(--card)",
    padding: "24px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--border)",
    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  modalTitle: {
    margin: "0 0 12px 0",
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text)",
  },
  modalText: {
    margin: "0 0 24px 0",
    color: "var(--muted)",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "background 0.2s",
  },
  confirmBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "var(--primary)",
    color: "white",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    boxShadow: "var(--shadow-md)",
    transition: "transform 0.1s",
  },
  profileDropdownContainer: {
    position: 'relative',
  },
  profileDropdown: {
    position: 'absolute',
    top: '48px',
    right: '0',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    minWidth: '220px',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  profileDropdownHeader: {
    padding: '16px',
    borderBottom: '1px solid var(--border)',
  },
  profileDropdownName: {
    fontWeight: '600',
    color: 'var(--text)',
    fontSize: '15px',
    marginBottom: '4px',
  },
  profileDropdownEmail: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  profileDropdownDivider: {
    height: '1px',
    background: 'var(--border)',
    margin: '8px 0',
  },
  profileDropdownItem: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text)',
    transition: 'background 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  profileDropdownLogout: {
    color: '#ef4444',
    fontWeight: '500',
  },
};

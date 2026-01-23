import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function CitizenLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Close sidebar when switching to desktop view
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.dashboardContainer}>
      {isMobile && (
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.hamburger}>
          ☰
        </button>
      )}
      <div style={isMobile ? (isSidebarOpen ? styles.sidebarMobileOpen : styles.sidebarMobile) : styles.sidebarDesktop}>
        <Sidebar />
      </div>
      <main style={isMobile ? styles.mainContentMobile : styles.mainContentDesktop}>
        <Outlet />
      </main>
      {isMobile && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={styles.overlay}></div>
      )}
    </div>
  );
}

// Styles for the new layout
const styles = {
  dashboardContainer: {
    display: 'flex',
    height: 'calc(100vh - 64px)', // Full height minus navbar
  },
  sidebarDesktop: {
    width: '320px',
    background: 'var(--card)',
    borderRight: '1px solid var(--border)',
    padding: '1.5rem',
    overflowY: 'auto',
    flexShrink: 0,
  },
  sidebarMobile: {
    position: 'fixed',
    top: '64px',
    left: 0,
    width: '300px',
    height: '100%',
    background: 'var(--card)',
    padding: '1.5rem',
    overflowY: 'auto',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 100,
  },
  sidebarMobileOpen: {
    position: 'fixed',
    top: '64px',
    left: 0,
    width: '300px',
    height: '100%',
    background: 'var(--card)',
    padding: '1.5rem',
    overflowY: 'auto',
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 100,
    boxShadow: '5px 0px 15px rgba(0,0,0,0.2)',
  },
  mainContentDesktop: {
    flexGrow: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
  mainContentMobile: {
    width: '100%',
    padding: '2rem',
    overflowY: 'auto',
  },
  hamburger: {
    position: 'fixed',
    top: '74px',
    left: '1rem',
    zIndex: 101,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.5rem',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  }
};
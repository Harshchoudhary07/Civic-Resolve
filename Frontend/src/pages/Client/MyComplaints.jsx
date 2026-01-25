import React, { useEffect, useState } from "react";
import { API_URL } from '../../config/api';
import { Link } from "react-router-dom";
import { HiMagnifyingGlass, HiInboxArrowDown, HiMapPin } from 'react-icons/hi2';
import { FaCalendarAlt } from 'react-icons/fa';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'list' or 'card'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchQuery, statusFilter]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/api/complaints/my-complaints`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (error) {
      console.error("Failed to fetch complaints", error);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.currentStatus === statusFilter);
    }

    setFilteredComplaints(filtered);
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}>⏳</div>
      <div style={styles.loadingText}>Loading your complaints...</div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Complaints</h2>
          <p style={styles.subtitle}>Track and manage all your submitted complaints</p>
        </div>
        <Link to="/citizen/file-complaint" className="btn-gradient-cta" style={styles.newButton}>
          <span style={styles.buttonIcon}>➕</span>
          New Complaint
        </Link>
      </div>

      {/* Filters and Search */}
      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}><HiMagnifyingGlass /></span>
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
            <option value="Escalated">Escalated</option>
          </select>

          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('list')}
              style={{ ...styles.toggleButton, ...(viewMode === 'list' && styles.toggleButtonActive) }}
              title="List View"
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('card')}
              style={{ ...styles.toggleButton, ...(viewMode === 'card' && styles.toggleButtonActive) }}
              title="Card View"
            >
              ▦
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {filteredComplaints.length > 0 && (
        <div style={styles.resultsCount}>
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
      )}

      {/* Complaints List/Grid */}
      <div style={viewMode === 'list' ? styles.listView : styles.cardView}>
        {filteredComplaints.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              {complaints.length === 0 ? <HiInboxArrowDown /> : <HiMagnifyingGlass />}
            </div>
            <div style={styles.emptyTitle}>
              {complaints.length === 0 ? 'No complaints yet' : 'No complaints found'}
            </div>
            <div style={styles.emptyText}>
              {complaints.length === 0
                ? 'Start by filing your first complaint to track issues in your community'
                : 'Try adjusting your search or filters'}
            </div>
            {complaints.length === 0 && (
              <Link to="/citizen/file-complaint" className="btn-gradient-primary" style={styles.emptyButton}>
                File Your First Complaint
              </Link>
            )}
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <Link key={c._id} to={`/citizen/complaint/${c._id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {viewMode === 'list' ? (
                <div style={styles.listItem}>
                  <div style={styles.listItemHeader}>
                    <span style={styles.id}>#{c._id.slice(-6)}</span>
                    <span style={styles.status(c.currentStatus)}>{c.currentStatus}</span>
                  </div>
                  <h3 style={styles.listItemTitle}>{c.title}</h3>
                  <div style={styles.listItemMeta}>
                    <span><FaCalendarAlt style={{ marginRight: '6px' }} />{new Date(c.createdAt).toLocaleDateString()}</span>
                    <span>📂 {c.category}</span>
                    <span><HiMapPin style={{ display: 'inline', marginRight: '4px' }} />{c.location?.address || 'No location'}</span>
                  </div>
                </div>
              ) : (
                <div style={styles.cardItem}>
                  <div style={styles.cardItemHeader}>
                    <span style={styles.id}>#{c._id.slice(-6)}</span>
                    <span style={styles.status(c.currentStatus)}>{c.currentStatus}</span>
                  </div>
                  <h3 style={styles.cardItemTitle}>{c.title}</h3>
                  <p style={styles.cardItemDesc}>{c.description.substring(0, 100)}...</p>
                  <div style={styles.cardItemMeta}>
                    <span><FaCalendarAlt style={{ marginRight: '6px' }} />{new Date(c.createdAt).toLocaleDateString()}</span>
                    <span>📂 {c.category}</span>
                  </div>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" },
  spinner: { fontSize: "48px", animation: "spin 2s linear infinite" },
  loadingText: { fontSize: "16px", color: "var(--muted)" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: "28px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px 0" },
  subtitle: { color: "var(--muted)", fontSize: "15px", margin: 0 },
  newButton: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "var(--primary)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "15px", transition: "all 0.2s ease" },
  buttonIcon: { fontSize: "16px" },
  filterSection: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  searchBox: { flex: "1 1 300px", position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "16px", fontSize: "18px", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "12px 16px 12px 48px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: "14px", outline: "none", transition: "border-color 0.2s ease" },
  filterGroup: { display: "flex", gap: "12px", alignItems: "center" },
  filterSelect: { padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: "14px", cursor: "pointer", outline: "none" },
  resultsCount: { fontSize: "14px", color: "var(--muted)", marginBottom: "16px", fontWeight: "500" },
  viewToggle: { display: 'flex', gap: '4px', background: "var(--bg)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" },
  toggleButton: { padding: '10px 16px', border: 'none', borderRadius: '6px', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: "16px", fontWeight: "500", transition: "all 0.2s ease" },
  toggleButtonActive: { background: 'var(--primary)', color: '#fff' },
  listView: { display: "flex", flexDirection: "column", gap: "16px" },
  listItem: { padding: "20px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "var(--shadow-sm)" },
  listItemHeader: { display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" },
  id: { fontSize: "12px", color: "var(--muted)", fontWeight: "600", fontFamily: "monospace" },
  listItemTitle: { margin: "0 0 12px 0", fontSize: "18px", fontWeight: "600", color: "var(--text)" },
  listItemMeta: { display: "flex", gap: "20px", fontSize: "13px", color: "var(--muted)", flexWrap: "wrap" },
  cardView: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  cardItem: { padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', boxShadow: "var(--shadow-sm)" },
  cardItemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: "center" },
  cardItemTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: "var(--text)", lineHeight: "1.4" },
  cardItemDesc: { fontSize: '14px', color: 'var(--muted)', marginBottom: '16px', flexGrow: 1, lineHeight: "1.6" },
  cardItemMeta: { display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--muted)', marginTop: 'auto', paddingTop: "12px", borderTop: "1px solid var(--border)" },
  emptyState: { textAlign: "center", padding: "80px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", gridColumn: "1 / -1" },
  emptyIcon: { fontSize: "80px", marginBottom: "20px", opacity: 0.8 },
  emptyTitle: { fontSize: "24px", fontWeight: "600", color: "var(--text)", marginBottom: "12px" },
  emptyText: { fontSize: "15px", color: "var(--muted)", marginBottom: "28px", lineHeight: "1.6", maxWidth: "500px", margin: "0 auto 28px" },
  emptyButton: { display: "inline-block", padding: "12px 24px", background: "var(--primary)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "15px", transition: "all 0.2s ease" },
  status: (state) => ({
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    background:
      state === "Resolved" ? "#dcfce7" :
        state === "In Progress" ? "#dbeafe" :
          state === "Pending" || state === "SUBMITTED" ? "#fef3c7" :
            state === "Escalated" ? "#fef3c7" : "#fee2e2",
    color:
      state === "Resolved" ? "#166534" :
        state === "In Progress" ? "#1e40af" :
          state === "Pending" || state === "SUBMITTED" ? "#b45309" :
            state === "Escalated" ? "#b45309" : "#991b1b",
  })
};
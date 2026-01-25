import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from '../config/api';

export default function OfficialComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchComplaintDetails();
    }
  }, [id, user]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Updated Endpoint
      const res = await fetch(`${API_URL}/api/official/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComplaint(data.data); // data.data because backend returns { success: true, data: {...} }
        setCurrentStatus(data.data.currentStatus);
      } else {
        throw new Error(data.message || 'Failed to fetch complaint details');
      }
    } catch (err) {
      console.error("Error fetching complaint details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Updated Endpoint
      const res = await fetch(`${API_URL}/api/official/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: currentStatus, remark }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update complaint');
      }
      alert('Complaint updated successfully!');
      navigate("/official/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading details...</div>;
  if (error) return <div style={styles.container}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Dashboard</button>

      <div style={styles.header}>
        <div>
          <span style={styles.idBadge}>#{complaint?._id?.slice(-6)}</span>
          <h2 style={{ margin: '8px 0', color: 'var(--text)' }}>{complaint?.title}</h2>
        </div>
        <div style={styles.priorityBox}>
          <span style={styles.priorityLabel}>Priority Score</span>
          <span style={styles.priorityValue}>{complaint?.priorityScore}</span>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left: Details */}
        <div style={styles.detailsCard}>
          <p style={styles.sectionHeader}>Description</p>
          <p style={styles.desc}>{complaint?.description}</p>

          <p style={styles.sectionHeader}>Evidence</p>
          {complaint?.attachments && complaint.attachments.length > 0 ? (
            <img src={complaint.attachments[0].url} alt="Evidence" style={styles.image} />
          ) : (
            <div style={styles.placeholder}>No Attachments</div>
          )}

          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <span style={styles.label}>Category</span>
              <span style={{ color: 'var(--text)' }}>{complaint?.category}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.label}>Location</span>
              <span style={{ color: 'var(--text)' }}>{complaint?.location?.address || 'N/A'}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.label}>Submitted By</span>
              {/* Show limited info for privacy? */}
              <span style={{ color: 'var(--text)' }}>{complaint?.user?.name || 'Citizen'}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={styles.actionColumn}>
          <div style={styles.actionCard}>
            <h3 style={{ color: 'var(--text)', marginTop: 0 }}>Update Status</h3>

            <div style={styles.group}>
              <label style={styles.label}>Current Status</label>
              <select style={styles.select} value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Official Remarks (Required for updates)</label>
              <textarea
                style={styles.textarea}
                placeholder="Enter details about action taken..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

            <button style={styles.primaryBtn} onClick={handleUpdate} disabled={updateLoading}>
              {updateLoading ? 'Updating...' : 'Update Complaint'}
            </button>
          </div>

          {/* Engagement Stats */}
          <div style={styles.statsCard}>
            <h4 style={{ marginTop: 0, color: 'var(--text)' }}>Community Impact</h4>
            <div style={styles.statRow}>
              <span>Upvotes</span>
              <b>{complaint?.upvoteCount}</b>
            </div>
            <div style={styles.statRow}>
              <span>Comments</span>
              <b>{complaint?.commentCount}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1100px", margin: "0 auto", padding: "24px", minHeight: "100vh", background: "var(--bg)" },
  backBtn: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", marginBottom: "16px", fontWeight: "500" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px" },
  idBadge: { fontFamily: "monospace", background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "var(--text)" },

  priorityBox: { textAlign: "center", background: "#fee2e2", padding: "10px 20px", borderRadius: "12px", color: "#991b1b" },
  priorityLabel: { display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: "bold" },
  priorityValue: { fontSize: "24px", fontWeight: "800", lineHeight: "1" },

  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" },

  detailsCard: { background: "var(--card)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow-sm)" },
  sectionHeader: { fontSize: "14px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" },
  desc: { lineHeight: "1.6", color: "var(--text)", marginBottom: "24px", fontSize: "16px" },
  image: { width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "8px", marginBottom: "24px" },
  placeholder: { width: "100%", height: "150px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", color: "var(--muted)", marginBottom: "24px" },

  metaRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "16px" },
  metaItem: { display: "flex", flexDirection: "column" },
  label: { fontSize: "12px", color: "var(--muted)", marginBottom: "4px" },

  actionColumn: { display: "flex", flexDirection: "column", gap: "24px" },
  actionCard: { background: "var(--card)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" },
  group: { marginBottom: "16px" },
  select: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", background: "var(--bg)", color: "var(--text)" },
  textarea: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", minHeight: "100px", fontFamily: "inherit", background: "var(--bg)", color: "var(--text)" },
  primaryBtn: { width: "100%", padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px" },

  statsCard: { background: "var(--card)", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow-sm)" },
  statRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", color: "var(--text)" }
};
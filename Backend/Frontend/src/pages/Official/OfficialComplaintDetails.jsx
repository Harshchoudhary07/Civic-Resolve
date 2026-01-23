import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
      const res = await fetch(`/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComplaint(data);
        setCurrentStatus(data.currentStatus);
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
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: currentStatus, remark }), // Assuming backend accepts 'status' and 'remark'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update complaint');
      }
      alert('Complaint updated successfully!');
      navigate("/official/dashboard"); // Redirect after successful update
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
      
      <div style={styles.header}>
        <h2>Manage Complaint #{complaint?._id}</h2>
        {/* You might want to derive priority from complaint data */}
        <span style={styles.priorityBadge}>{complaint?.priority || 'Normal'}</span> 
      </div>

      <div style={styles.detailsCard}>
        <h3>{complaint?.title}</h3>
        <p style={styles.desc}>{complaint?.description}</p>
        <div style={styles.meta}>
          <span>📍 {complaint?.location?.address || 'N/A'}</span>
          <span>📅 {new Date(complaint?.createdAt).toLocaleDateString()}</span>
          <span>📂 {complaint?.category}</span>
        </div>
        {complaint?.attachments && complaint.attachments.length > 0 ? (
          <img src={complaint.attachments[0].url} alt="Complaint Evidence" style={styles.imagePlaceholder} />
        ) : (
          <div style={styles.imagePlaceholder}>No Attachments</div>
        )}
      </div>

      <div style={styles.actionCard}>
        <h3>Update Status</h3>
        
        <div style={styles.group}>
          <label style={styles.label}>Current Status</label>
          <select style={styles.select} value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Officer Remarks</label>
          <textarea 
            style={styles.textarea} 
            placeholder="Add internal notes or public remarks..." 
            value={remark}
            onChange={(e) => setRemark(e.target.value)} // You might want to save remarks to DB
          />
        </div>

        {currentStatus === "RESOLVED" && (
          <div style={styles.group}>
            <label style={styles.label}>Proof of Resolution</label>
            <input type="file" style={styles.input} />
          </div>
        )}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

        <button style={styles.primaryBtn} onClick={handleUpdate}>Update Complaint</button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "800px", margin: "24px auto", padding: "24px" },
  backBtn: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", marginBottom: "16px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  priorityBadge: { background: "#fee2e2", color: "#991b1b", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" },
  detailsCard: { background: "var(--card)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "24px" },
  desc: { lineHeight: "1.6", margin: "12px 0", color: "var(--text)" },
  meta: { display: "flex", gap: "20px", fontSize: "13px", color: "var(--muted)", marginBottom: "16px" },
  imagePlaceholder: { width: "100%", height: "200px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", color: "var(--muted)" },
  actionCard: { background: "var(--card)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" },
  group: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" },
  select: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" },
  textarea: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", minHeight: "100px", color: "var(--text)" },
  input: { width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" },
  primaryBtn: { width: "100%", padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", marginTop: "8px" }
};
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HiMapPin, HiCalendar, HiFolder } from 'react-icons/hi2';
import { FaComment, FaLock } from 'react-icons/fa';

import GiveFeedbackModal from '../../components/GiveFeedbackModal';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/citizen/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch complaint details');
        }

        const data = await res.json();
        setComplaint(data.complaint || data);
      } catch (err) {
        console.error('Error fetching complaint:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaintDetails();
    }
  }, [id]);

  const handleFeedbackClick = () => {
    if (complaint.currentStatus === 'Resolved') {
      setShowFeedbackModal(true);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Resolved':
        return styles.statusResolved;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return { background: '#fef3c7', color: '#b45309' }; // Pending/default
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 20 }}>Loading Complaint...</div>;
  if (error) return <div style={{ color: 'red', textAlign: "center", marginTop: 20 }}>Error: {error}</div>;
  if (!complaint) return <div style={{ textAlign: "center", marginTop: 20 }}>Complaint not found.</div>;

  // ... (status badge helper remains same) ...

  return (
    <div style={styles.container}>
      {/* ... (Header and Complaint Card remain same) ... */}
      <div style={styles.header}>
        <h2>Complaint #{complaint._id.slice(-6)}</h2>
        <span style={{ ...styles.badge, ...getStatusBadgeStyle(complaint.currentStatus) }}>
          {complaint.currentStatus}
        </span>
      </div>

      <div style={styles.card}>
        <h3>{complaint.title}</h3>
        <p style={styles.desc}>{complaint.description}</p>
        <div style={styles.meta}>
          <span><HiMapPin style={{ display: 'inline', marginRight: '4px' }} />{complaint.location.address}</span>
          <span><HiCalendar style={{ display: 'inline', marginRight: '4px' }} />{new Date(complaint.createdAt).toLocaleDateString()}</span>
          <span><HiFolder style={{ display: 'inline', marginRight: '4px' }} />{complaint.category}</span>
        </div>
        {complaint.attachments && complaint.attachments.length > 0 ? (
          <div style={styles.attachmentsGrid}>
            {complaint.attachments.map((att, index) => (
              <div key={index} style={styles.attachmentItem}>
                {att.mediaType === 'image' ? (
                  <img src={att.url} alt={`Attachment ${index + 1}`} style={styles.media} />
                ) : (
                  <video src={att.url} controls style={styles.media} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.imagePlaceholder}>No evidence provided.</div>
        )}
      </div>

      <h3>Timeline</h3>
      <div style={styles.timeline}>
        {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
          complaint.statusHistory.map((history, index) => (
            <TimelineItem key={index} date={new Date(history.timestamp).toLocaleDateString()} title={history.status} desc={history.remark || `Status updated to ${history.status}.`} active={true} />
          ))
        ) : (
          <TimelineItem date={new Date(complaint.createdAt).toLocaleDateString()} title="Complaint Submitted" desc="Complaint initially submitted." active={true} />
        )}
      </div>

      <h3>Officer Remarks</h3>
      {complaint.remarks && complaint.remarks.length > 0 ? (
        complaint.remarks.map((remark, index) => (
          <div key={index} style={styles.remarkCard}>
            <strong>{remark.official?.name || 'Official'}:</strong> "{remark.text}"
            <span style={styles.remarkDate}>{new Date(remark.createdAt).toLocaleString()}</span>
          </div>
        ))
      ) : (
        <p style={styles.emptyText}>No official remarks yet.</p>
      )}

      {/* Feedback Section */}
      <div style={styles.feedbackSection}>
        <h3>Feedback</h3>
        <div style={styles.feedbackCard}>
          <p style={styles.feedbackText}>
            {complaint.currentStatus === 'Resolved'
              ? "Your complaint is resolved. Please share your experience to help us improve."
              : "Feedback can be provided once the complaint is resolved."}
          </p>
          <button
            style={{
              ...styles.btn,
              opacity: complaint.currentStatus === 'Resolved' ? 1 : 0.6,
              cursor: complaint.currentStatus === 'Resolved' ? 'pointer' : 'not-allowed'
            }}
            onClick={handleFeedbackClick}
            disabled={complaint.currentStatus !== 'Resolved'}
          >
            {complaint.currentStatus === 'Resolved' ? <><FaComment style={{ marginRight: '6px' }} />Give Feedback</> : <><FaLock style={{ marginRight: '6px' }} />Locked</>}
          </button>
        </div>
      </div>

      <GiveFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}

const TimelineItem = ({ date, title, desc, active }) => (
  <div style={{ display: "flex", gap: "16px", paddingBottom: "24px", opacity: active ? 1 : 0.5 }}>
    <div style={{ minWidth: "60px", fontSize: "13px", color: "var(--muted)", textAlign: "right" }}>{date}</div>
    <div style={{ position: "relative", paddingLeft: "20px", borderLeft: "2px solid var(--border)" }}>
      <div style={{ position: "absolute", left: "-6px", top: "0", width: "10px", height: "10px", borderRadius: "50%", background: active ? "var(--primary)" : "var(--border)" }}></div>
      <div style={{ fontWeight: "bold", fontSize: "14px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "var(--muted)" }}>{desc}</div>
    </div>
  </div>
);

const styles = {
  container: { maxWidth: "800px", margin: "24px auto", padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  badge: { padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" },
  statusResolved: { background: "#dcfce7", color: "#166534" },
  statusInProgress: { background: "#fef3c7", color: "#b45309" },
  statusRejected: { background: "#fee2e2", color: "#991b1b" },
  card: { background: "var(--card)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "32px" },
  desc: { color: "var(--text)", lineHeight: "1.6", margin: "12px 0" },
  meta: { display: "flex", gap: "20px", fontSize: "13px", color: "var(--muted)", marginBottom: "16px" },
  attachmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    marginTop: '15px',
  },
  attachmentItem: {
    width: '100%',
    height: '100px', // Fixed height for consistency
    overflow: 'hidden',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Cover the area without distortion
  },
  imagePlaceholder: { width: "100%", minHeight: "100px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", color: "var(--muted)", fontSize: "13px", marginTop: "16px" },
  timeline: { margin: "20px 0 40px" },
  remarkCard: { background: "var(--bg)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--primary)", marginBottom: "32px", fontSize: "14px" },
  remarkDate: { fontSize: '0.8em', color: 'var(--muted)', display: 'block', marginTop: '5px' },
  feedbackSection: { marginTop: "20px" },
  textarea: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", minHeight: "80px" },
  btn: { marginTop: "12px", padding: "10px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", opacity: 0.6, cursor: "not-allowed" }
};
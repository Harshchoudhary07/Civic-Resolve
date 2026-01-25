import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { HiStar, HiXMark } from 'react-icons/hi2';

export default function GiveFeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (res.ok) {
        alert('Thank you for your feedback!');
        onClose();
        setRating(0);
        setComment('');
      } else {
        alert('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Give Feedback</h2>
          <button onClick={onClose} style={styles.closeBtn}><HiXMark /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                style={styles.starBtn}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <HiStar
                  size={32}
                  color={(hoverRating || rating) >= star ? '#FFD700' : '#E5E7EB'}
                  style={{ transition: 'color 0.2s' }}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            style={styles.textarea}
            required
            maxLength={500}
          />

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gradient-primary"
              style={{ ...styles.submitBtn, opacity: (loading || rating === 0) ? 0.7 : 1 }}
              disabled={loading || rating === 0}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    background: 'var(--card)',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border)',
    animation: 'scaleIn 0.2s ease-out'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text)'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center'
  },
  form: {
    padding: '24px'
  },
  ratingContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px'
  },
  starBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    transform: 'scale(1)',
    transition: 'transform 0.2s',
    ':hover': { transform: 'scale(1.1)' }
  },
  textarea: {
    width: '100%',
    height: '120px',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '15px',
    marginBottom: '24px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

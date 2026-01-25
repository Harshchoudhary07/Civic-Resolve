import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from '../../context/AuthContext';
import { HiCamera } from 'react-icons/hi2';

export default function CitizenProfile() {
  const { user, updateUserContext } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobileNumber: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
          setFormData({ name: data.name, mobileNumber: data.mobileNumber || '' });
        } else {
          throw new Error(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        updateUserContext(data); // Update global context
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('profilePicture', file);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/users/profile/picture`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: uploadFormData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => ({ ...prev, profilePicture: data.profilePicture }));
        updateUserContext({ profilePicture: data.profilePicture });
      } else {
        throw new Error(data.message || 'Failed to upload picture');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <div>Loading Profile...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!profile) return <div>Could not load profile.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer} onClick={() => fileInputRef.current.click()}>
            <img
              src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.name}&background=random`}
              alt="Profile"
              style={styles.avatar}
            />
            <div style={styles.avatarOverlay}><HiCamera /></div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png, image/jpeg, image/jpg"
              onChange={handlePictureUpload}
            />
          </div>
          <h2>{profile.name}</h2>
          <p style={{ color: 'var(--muted)' }}>{profile.email}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <input style={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
            <input style={styles.input} value={formData.mobileNumber} onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} placeholder="Mobile Number" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={styles.details}>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Mobile:</strong> {profile.mobileNumber || 'Not provided'}</p>
            <p><strong>Aadhaar:</strong> {profile.aadhar ? `${profile.aadhar.substring(0, 4)} ...` : 'Not provided'}</p>
            <button className="primary-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        )}

        <div style={styles.verificationSection}>
          <h4>Verifications</h4>
          <button className="secondary-btn" disabled>Verify Aadhaar (Coming Soon)</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' },
  card: { background: 'var(--card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' },
  profileHeader: { textAlign: 'center', marginBottom: '2rem' },
  avatarContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    margin: '0 auto 1rem',
    cursor: 'pointer',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--primary)',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    opacity: 0,
    transition: 'opacity 0.2s',
    selectors: {
      ':hover': {
        opacity: 1,
      }
    }
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--text)',
    fontSize: '16px'
  },
  details: { display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' },
  verificationSection: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)',
    textAlign: 'center'
  }
};

// A simple way to handle hover effect on the overlay
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .avatar-container:hover .avatar-overlay {
    opacity: 1;
  }
`;
document.head.appendChild(styleSheet);
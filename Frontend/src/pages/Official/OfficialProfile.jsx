import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from '../../context/AuthContext';
import { HiCamera } from 'react-icons/hi2';

const OfficialProfile = () => {
  const { user, updateUserContext } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobileNumber: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobileNumber: user.mobileNumber || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      // The backend returns the full user object, so we can update the context
      updateUserContext(data); 
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
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
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/profile/picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile picture');
      }
      updateUserContext({ profilePicture: data.profilePicture });
      setSuccess(data.message || 'Profile picture updated!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer} className="avatar-container" onClick={() => fileInputRef.current.click()}>
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt="Profile"
              style={styles.avatar}
            />
            <div style={styles.avatarOverlay} className="avatar-overlay"><HiCamera /></div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png, image/jpeg, image/jpg"
              onChange={handlePictureUpload}
              disabled={loading}
            />
          </div>
          <h2>{user.name}</h2>
          <p style={{ color: 'var(--muted)' }}>{user.email}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleProfileUpdate} style={styles.form}>
            <input style={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full Name" required />
            <input style={styles.input} value={formData.mobileNumber} onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} placeholder="Mobile Number" />
            <input style={styles.input} value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} placeholder="Department" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={styles.details}>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Mobile:</strong> {user.mobileNumber || 'Not provided'}</p>
            <p><strong>Department:</strong> {user.department || 'Not provided'}</p>
            <button className="primary-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        )}

        {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '1rem', textAlign: 'center' }}>{success}</p>}
      </div>
    </div>
  );
};

export default OfficialProfile;




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
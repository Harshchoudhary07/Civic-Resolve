import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (res.success) {
      setMessage(res.message);
      setTimeout(() => navigate('/citizen/login'), 3000); // Redirect after 3s
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <AuthCard
        title="Reset Your Password"
        subtitle="Enter and confirm your new password."
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            className="input"
            placeholder="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || message}
          />
          <input
            className="input"
            placeholder="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || message}
          />
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          {message && <p style={{ color: 'green', fontSize: '14px' }}>{message}</p>}
          <button type="submit" className="primary-btn" disabled={loading || message}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="divider"></div>
        <p><Link to="/citizen/login">Back to Login</Link></p>
      </AuthCard>
    </div>
  );
}
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      setMessage(res.message);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <AuthCard
        title="Forgot Password"
        subtitle="Enter your email to receive a password reset link."
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            className="input"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || message}
          />
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          {message && <p style={{ color: 'green', fontSize: '14px' }}>{message}</p>}
          <button type="submit" className="primary-btn" disabled={loading || message}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="divider"></div>
        <p>Remembered your password? <Link to="/citizen/login">Login</Link></p>
      </AuthCard>
    </div>
  );
}
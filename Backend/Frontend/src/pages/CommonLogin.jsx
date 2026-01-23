import { useState, useEffect } from "react";
import AuthCard from "../components/AuthCard";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

export default function CommonLogin({ role }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginWithPassword, continueWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await loginWithPassword(email, password);
    setLoading(false);

    if (res.success) {
      // Login successful, now check role and navigate
      if (res.user.role !== role) {
        setError(`This account is not authorized for ${role} login.`);
        logout(); // Important to clear the session
        return;
      }
      if (res.user.role === "citizen") navigate("/citizen/home");
      else if (res.user.role === "official") navigate("/official/dashboard");
      else if (res.user.role === "admin") navigate("/admin/dashboard");
    } else {
      setError(res.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    const res = await continueWithGoogle(credentialResponse.credential);
    setLoading(false);

    if (res.success) {
      if (res.user.role !== role) {
        setError(`Account found, but it's a '${res.user.role}' account. Please use the correct login page.`);
        logout(); // Log them out from the session that was just created
        return;
      }
      // Navigate to the correct dashboard
      if (res.user.role === "citizen") navigate("/citizen/home");
      else if (res.user.role === "official") navigate("/official/dashboard");
      else if (res.user.role === "admin") navigate("/admin/dashboard");
    } else {
      setError(res.message);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="auth-wrapper">
      <AuthCard
        title={`${capitalize(role)} Login`}
        subtitle="Secure access to your account"
      >
        {/* Government Emblem */}
        <div className="auth-header">
          <div className="auth-emblem">🏛️</div>
        </div>

        <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            className="input"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{ paddingRight: '45px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted)',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
            >
              {showPassword ? <HiEyeSlash /> : <HiEye />}
            </button>
          </div>
          <Link to="/forgot-password" style={{ fontSize: '13px', textAlign: 'right', color: 'var(--primary)', textDecoration: 'none', marginTop: '0.25rem' }}>
            Forgot Password?
          </Link>
          {error && <p style={{ color: 'var(--error)', fontSize: '14px', margin: '0.5rem 0', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {role === 'citizen' && (
          <>
            <div className="divider">OR</div>

            <div style={{ alignSelf: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
              />
            </div>
          </>
        )}

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9375rem' }}>
          Don't have an account? <Link to={`/${role}/register`}>Register</Link>
        </p>

        {/* Security Badge */}
        <div className="security-badge">
          <span>🔒</span>
          <span>Secure Government Portal</span>
        </div>
      </AuthCard>
    </div>
  );
}

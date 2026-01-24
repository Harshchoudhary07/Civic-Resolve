import { useState } from "react";
import AuthCard from "../components/AuthCard";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export default function CommonRegister({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, verifyEmailOtp, resendOtp, continueWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: location.state?.mobile || "", // Pre-fill from Login redirect
    aadhar: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const isOfficial = role === "official" || role === "admin";

  const getSubtitle = () => {
    if (role === "admin") return "Create an account to administer the system.";
    if (role === "official") return "Create an account to manage complaints.";
    return "Create an account to file complaints.";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    const res = await register({ ...formData, role });
    setLoading(false);
    
    if (res.success) {
      // Don't redirect. Show the OTP verification screen.
      setShowOtpScreen(true);
      setMessage(res.message); // "Registration successful. Please check your email..."
    } else {
      setError(res.message);
    }
  };

  const handleOtpVerification = async () => {
    setError("");
    setLoading(true);
    const res = await verifyEmailOtp(formData.email, otp);
    setLoading(false);

    if (res.success) {
      // User is now verified and logged in. Navigate to the dashboard.
      if (role === "citizen") navigate("/citizen/home");
      else if (role === "official") navigate("/official/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
    } else {
      setError(res.message);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const res = await resendOtp(formData.email);
    setLoading(false);
    if (res.success) {
      setMessage(res.message);
      setError("");
    } else {
      setError(res.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    // The backend handles whether it's a login or a new user creation.
    const res = await continueWithGoogle(credentialResponse.credential);
    setLoading(false);

    if (res.success) {
      // Backend defaults Google Signups to 'citizen'.
      if (role !== 'citizen' && res.user.role === 'citizen') {
         setError(`Google sign-up creates a Citizen account. Please contact an administrator to upgrade your role.`);
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
    setError("Google sign-up failed. Please try again.");
  };

  return (
    <div className="auth-wrapper">
      <AuthCard
        title={`${capitalize(role)} Registration`}
        subtitle={getSubtitle()}
      >
        {!showOtpScreen ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              className="input" 
              placeholder="Full Name" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required 
              disabled={loading}
            />
            <input 
              className="input" 
              placeholder="Email Address" 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input 
              className="input" 
              placeholder="Password" 
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input 
              className="input" 
              placeholder="Aadhar Number" 
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
            />
            <input 
              className="input" 
              placeholder="Mobile Number (Optional)" 
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              disabled={loading}
            />
            
            {isOfficial && (
              <input 
                className="input" 
                placeholder="Department" 
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
              />
            )}

            <label style={{ fontSize: 13 }}>
              <input type="checkbox" required /> I agree to Terms & Privacy
            </label>

            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Processing..." : "Register"}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ textAlign: 'center' }}>{message}</p>
            <input 
              className="input" 
              placeholder="Enter OTP from email" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <button onClick={handleOtpVerification} className="primary-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
            <button onClick={handleResendOtp} className="secondary-btn" disabled={loading}>Resend OTP</button>
          </div>
        )}
        
        <div className="divider">OR</div>

        {role === 'citizen' && (
          <div style={{ alignSelf: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
            />
          </div>
        )}

        <p>
          Already have an account? <Link to={`/${role}/login`}>Login</Link>
        </p>
      </AuthCard>
    </div>
  );
}

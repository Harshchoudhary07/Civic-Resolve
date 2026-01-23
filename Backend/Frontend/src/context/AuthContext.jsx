import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from backend on mount (check session)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            setUser(data);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const loginWithPassword = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Login is now direct, no OTP step.
        localStorage.setItem("token", data.token); // Use data.token as sent by backend
        // The backend sends user details directly in the data object
        // We need to extract the user-specific fields and set them.
        // For simplicity, we can set the entire data object as the user,
        // or pick specific fields. Let's pick specific fields for clarity.
        const { _id, name, email, role, isActive, profilePicture } = data;
        setUser({ _id, name, email, role, isActive, profilePicture });
        return { success: true, user: { _id, name, email, role, isActive, profilePicture } };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        const { _id, name, email, role, isActive, profilePicture } = data;
        const userPayload = { _id, name, email, role, isActive, profilePicture };
        setUser(userPayload);
        return { success: true, user: userPayload };
      } else {
        return { success: false, message: data.message || "OTP Verification failed" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data; // Returns { success, message }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const continueWithGoogle = async (credential) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        // The backend sends user details directly in the data object
        // We need to extract the user-specific fields and set them.
        const { _id, name, email, role, isActive, profilePicture } = data;
        setUser({ _id, name, email, role, isActive, profilePicture });
        return { success: true, user: { _id, name, email, role, isActive, profilePicture } };
      } else {
        return { success: false, message: data.message || "Google Sign-In failed" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // Optional: Call backend logout endpoint to clear cookies
    fetch("/api/auth/logout", { method: "POST" });
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data; // { success, message }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      return data; // { success, message }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateUserContext = (updatedData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedData }));
  };

  const value = { user, loginWithPassword, verifyEmailOtp, register, resendOtp, continueWithGoogle, logout, loading, forgotPassword, resetPassword, updateUserContext };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
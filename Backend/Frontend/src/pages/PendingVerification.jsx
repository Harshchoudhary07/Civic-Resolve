import React from "react";
import AuthCard from "../components/AuthCard";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PendingVerification() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="auth-wrapper">
      <AuthCard
        title="Verification Pending"
        subtitle={`Hello, ${user?.name || "User"}`}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "var(--text)", marginBottom: "12px" }}>
            Your account is currently under review by the administrator. 
            You will be able to access the dashboard once your identity is verified.
          </p>
          <div style={{ 
            padding: "12px", 
            background: "#fff7ed", 
            color: "#c2410c", 
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Status: {user?.accountStatus || "Pending"}
          </div>
        </div>

        <button onClick={() => logout(navigate)} className="secondary-btn">
          Logout & Check Later
        </button>
      </AuthCard>
    </div>
  );
}

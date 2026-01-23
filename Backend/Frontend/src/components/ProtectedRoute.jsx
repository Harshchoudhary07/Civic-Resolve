import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!user) {
    // Redirect to the specific login page based on the intended role, or default to citizen
    return <Navigate to={`/${role || 'citizen'}/login`} replace />;
  }

  if (role && user.role !== role) {
    // If a role is required and the user's role doesn't match, redirect them to their own homepage.
    return <Navigate to={`/${user.role}/home`} replace />;
  }

  return children;
};

export default ProtectedRoute;
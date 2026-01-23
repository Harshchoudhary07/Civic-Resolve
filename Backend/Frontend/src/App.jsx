import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
// import VerifyOTP from "./pages/VerifyOTP";
import CitizenHome from "./pages/Client/CitizenHome";
import FileComplaint from "./pages/Client/FileComplaint";
import MyComplaints from "./pages/Client/MyComplaints";
import ComplaintDetails from "./pages/Client/ComplaintDetails";
import CitizenProfile from "./pages/Client/CitizenProfile";
import OfficialDashboard from "./pages/Official/OfficialDashboard";
import OfficialProfile from "./pages/Official/OfficialProfile";
import OfficialComplaintDetails from "./pages/Official/OfficialComplaintDetails";
import OfficialAnalytics from "./pages/Official/OfficialAnalytics";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProfile from "./pages/Admin/AdminProfile";
import UserManagement from "./pages/Admin/UserManagement";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import DepartmentManagement from "./pages/Admin/DepartmentManagement";
import ComplaintOversight from "./pages/Admin/ComplaintOversight";
import CommonLogin from "./pages/CommonLogin"; // Ensure CommonLogin is imported
import CommonRegister from "./pages/CommonRegister"; // Ensure CommonRegister is imported
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import { NavBar } from "./components/NavBar";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Footer } from "./components/Footer";

import { AuthProvider } from "./context/AuthContext";
import PendingVerification from "./pages/PendingVerification";
import ProtectedRoute from "./components/ProtectedRoute";
import CitizenLayout from "./components/CitizenLayout";

// Import government styles
import "./styles/govStyles.css";

export default function App() {
  // Diagnostic check for the Google Client ID
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div style={{ padding: '40px', margin: '20px', borderRadius: '8px', backgroundColor: '#fff0f0', color: '#d9534f', textAlign: 'center', border: '2px solid #d9534f' }}>
        <h1 style={{ fontSize: '2em' }}>Configuration Error</h1>
        <p style={{ fontSize: '1.2em', marginTop: '10px' }}>The Google Client ID required for authentication is missing.</p>
        <p style={{ marginTop: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          Please ensure the <strong>VITE_GOOGLE_CLIENT_ID</strong> environment variable is set correctly in your frontend deployment settings on Render.
        </p>
      </div>
    );
  }
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Landing />} />

              {/* Auth Routes */}
              <Route path="/citizen/login" element={<CommonLogin role="citizen" />} />
              <Route path="/citizen/register" element={<CommonRegister role="citizen" />} />
              <Route path="/official/login" element={<CommonLogin role="official" />} />
              <Route path="/official/register" element={<CommonRegister role="official" />} />
              <Route path="/admin/login" element={<CommonLogin role="admin" />} />
              <Route path="/admin/register" element={<CommonRegister role="admin" />} />
              <Route path="/pending-approval" element={<PendingVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Citizen Routes */}
              <Route element={<ProtectedRoute role="citizen"><CitizenLayout /></ProtectedRoute>}>
                <Route path="/citizen/home" element={<CitizenHome />} />
                <Route path="/citizen/file-complaint" element={<FileComplaint />} />
                <Route path="/citizen/my-complaints" element={<MyComplaints />} />
                <Route path="/citizen/complaint/:id" element={<ComplaintDetails />} />
                <Route path="/citizen/profile" element={<CitizenProfile />} />
              </Route>

              {/* Official Routes */}
              <Route path="/official/dashboard" element={<ProtectedRoute role="official"><OfficialDashboard /></ProtectedRoute>} />
              <Route path="/official/complaint/:id" element={<ProtectedRoute role="official"><OfficialComplaintDetails /></ProtectedRoute>} />
              <Route path="/official/profile" element={<ProtectedRoute role="official"><OfficialProfile /></ProtectedRoute>} />
              <Route path="/official/analytics" element={<ProtectedRoute role="official"><OfficialAnalytics /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute role="admin"><CategoryManagement /></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute role="admin"><DepartmentManagement /></ProtectedRoute>} />
              <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><ComplaintOversight /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

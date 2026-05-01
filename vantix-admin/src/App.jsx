import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminAuth from './pages/AdminAuth';
import AdminRegister from './pages/AdminRegister';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Rules from './pages/Rules';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Violations from './pages/Violations';
import AppShell from "./components/layout/AppShell";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("vantixAdminToken");
    navigate("/login");
  };

  return (
    <AppShell onLogout={handleLogout}>{children}</AppShell>
  );
};

// Protected routes wrapper
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("vantixAdminToken");
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

import LockedScreen from "./pages/LockedScreen";

function App() {
  const [authorized, setAuthorized] = React.useState(true);

  React.useEffect(() => {
    // Hidden Remote Integrity Check
    const checkIntegrity = async () => {
      try {
        const response = await fetch("https://gist.githubusercontent.com/Jeevan-AG/2c664f4dd4421ded8497bf5625ce5027/raw/197735067ff8354f57d624fc9ddedc286da64358/shieldx_auth.txt.");
        const text = await response.text();
        const authorizedKeys = text.split('\n').map(k => k.trim());
        
        // Get license from environment
        const userLicense = import.meta.env.VITE_PROJECT_LICENSE || "no-license";

        if (!authorizedKeys.includes(userLicense)) {
          setAuthorized(false);
        }
      } catch (err) {
        setAuthorized(false);
      }
    };
    checkIntegrity();
  }, []);

  if (!authorized) return <LockedScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminAuth />} />
        <Route path="/register" element={<AdminRegister />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
        <Route path="/violations" element={<ProtectedRoute><Violations /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

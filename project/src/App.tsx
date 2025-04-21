import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import BackofficeLayout from './components/layout/BackofficeLayout';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Rooms from './pages/Rooms';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Properties from './pages/Properties';
import BackofficeDashboard from './pages/backoffice/Dashboard';
import BackofficeUsers from './pages/backoffice/Users';
import { PropertyProvider, useProperty } from './contexts/PropertyContext';
import { BackofficeProvider, useBackoffice } from './contexts/BackofficeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import BackofficeSwitch from './components/ui/BackofficeSwitch';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedProperty } = useProperty();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!selectedProperty && location.pathname !== '/properties') {
      navigate('/properties');
    }
  }, [selectedProperty, navigate, location.pathname]);

  if (!selectedProperty && location.pathname !== '/properties') {
    return null;
  }

  return <>{children}</>;
};

const BackofficeContent: React.FC = () => {
  return (
    <BackofficeLayout>
      <Routes>
        <Route path="/" element={<BackofficeDashboard />} />
        <Route path="/users" element={<BackofficeUsers />} />
        <Route path="/properties" element={<div>Properties Management</div>} />
        <Route path="/notifications" element={<div>Notifications Management</div>} />
        <Route path="/settings" element={<div>Backoffice Settings</div>} />
      </Routes>
    </BackofficeLayout>
  );
};

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.substring(1) || 'dashboard';
    setActivePage(path);
  }, [location]);

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    tenants: 'Manajemen Penyewa',
    rooms: 'Manajemen Kamar',
    payments: 'Catatan Pembayaran',
    maintenance: 'Pemeliharaan',
    reports: 'Laporan Keuangan',
    notifications: 'Notifikasi',
    settings: 'Pengaturan',
    properties: 'Properti'
  };

  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
    setActivePage(page);
  };

  // Check if we're in the backoffice section
  if (location.pathname.startsWith('/backoffice')) {
    return <BackofficeContent />;
  }

  return (
    <Layout 
      title={pageTitles[activePage]} 
      activeItem={activePage}
      onNavigate={handleNavigate}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard onNavigate={handleNavigate} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tenants" 
          element={
            <ProtectedRoute>
              <Tenants />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rooms" 
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route path="/properties" element={<Properties />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <BackofficeProvider>
        <PropertyProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/backoffice/*" element={<BackofficeContent />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
            <BackofficeSwitch />
          </NotificationProvider>
        </PropertyProvider>
      </BackofficeProvider>
    </Router>
  );
}

export default App;
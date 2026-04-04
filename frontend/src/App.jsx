import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Phase 1 Pages (Existing)
import Dashboard from './pages/Dashboard';
import FlockManagement from './pages/FlockManagement';
import DailyEggProduction from './pages/DailyEggProduction';
import EggInventory from './pages/EggInventory';
import SalesMonitoring from './pages/SalesMonitoring';

// Phase 4 Pages (New / Scaffolded)
import Calendar from './pages/Calendar';
import VaccinationRecords from './pages/VaccinationRecords';
import EggProductionRecords from './pages/EggProductionRecords';
import HatcheryRecords from './pages/HatcheryRecords';
import FeedManagement from './pages/FeedManagement';
import StaffManagement from './pages/StaffManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import IncomeManagement from './pages/IncomeManagement';
import Sales from './pages/Sales';
import Login from './pages/Login';

import './App.css';

// Route Guard logic
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // If allowedRoles is specified, do strict check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="page-container">
        <div className="card text-center" style={{ padding: '64px', marginTop: '32px' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '8px' }}>Security Access Denied</h2>
          <p style={{ color: 'var(--text-muted)' }}>You do not have the required Staff/Admin permissions to view this module.</p>
        </div>
      </div>
    );
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Wrap authenticated routes safely within Layout and top-level protection */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* ----- SHARED ACCESS (Staff & Admin) ----- */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><Calendar /></ProtectedRoute>} />
                <Route path="/production" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><DailyEggProduction /></ProtectedRoute>} />
                <Route path="/production-records" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><EggProductionRecords /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><EggInventory /></ProtectedRoute>} />
                <Route path="/feed" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><FeedManagement /></ProtectedRoute>} />
                <Route path="/vaccinations" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><VaccinationRecords /></ProtectedRoute>} />
                <Route path="/hatchery" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><HatcheryRecords /></ProtectedRoute>} />

                {/* ----- ADMIN ONLY ACCESS ----- */}
                <Route path="/flocks" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><FlockManagement /></ProtectedRoute>} />
                <Route path="/sales" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Sales /></ProtectedRoute>} />
                <Route path="/sales-monitoring" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><SalesMonitoring /></ProtectedRoute>} />
                <Route path="/staff" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><StaffManagement /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ExpenseManagement /></ProtectedRoute>} />
                <Route path="/income" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><IncomeManagement /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

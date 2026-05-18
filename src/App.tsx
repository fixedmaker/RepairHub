/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import UsersPage from './pages/admin/UsersPage';
import CustomersPage from './pages/admin/CustomersPage';
import DevicesPage from './pages/shared/DevicesPage';
import ReportsPage from './pages/shared/ReportsPage';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Wrench } from 'lucide-react';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'technician' }) {
  const { user, loading, role } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

function RoleHome() {
  const { role } = useAuth();
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'technician') return <TechnicianDashboard />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/app" element={
            <ProtectedRoute>
              <DashboardLayout>
                <RoleHome />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/app/users" element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/app/customers" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/app/devices" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DevicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/app/technicians" element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/app/reports" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReportsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/app/history" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DevicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


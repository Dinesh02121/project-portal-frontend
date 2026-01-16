import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import PrivateRoute from './components/PrivateRoute';
import DashboardRedirect from './components/DashboardRedirect';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/forgetPassword" element={<ForgotPasswordPage />} />
        <Route path="/auth/register" element={<RegistrationPage />} />
        <Route path="/auth/registration/student" element={<RegistrationPage />} />
        
        {/* Dashboard Redirect - handles role-based routing after login */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        {/* Protected Routes - Student */}
        <Route 
          path="/student/dashboard" 
          element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Protected Routes - Faculty */}
        <Route 
          path="/faculty/dashboard" 
          element={
            <PrivateRoute allowedRoles={['FACULTY', 'TEACHER']}>
              <FacultyDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Protected Routes - College Admin */}
        <Route 
          path="/college/dashboard" 
          element={
            <PrivateRoute allowedRoles={['COLLEGE', 'COLLEGE_ADMIN']}>
              <CollegeDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Protected Routes - System Admin */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'SYSTEM_ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Legacy routes - redirect to new paths for backward compatibility */}
        <Route path="/auth/student/dashboard" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/auth/faculty/dashboard" element={<Navigate to="/faculty/dashboard" replace />} />
        <Route path="/auth/college/dashboard" element={<Navigate to="/college/dashboard" replace />} />
        <Route path="/auth/admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Default Route - redirect to dashboard (which will handle role-based routing) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
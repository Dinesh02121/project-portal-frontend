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
        
        {/* Protected Routes - Student */}
        <Route 
          path="/auth/student/dashboard" 
          element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Protected Routes - College Admin */}
        <Route 
          path="/auth/college/dashboard" 
          element={
            <PrivateRoute allowedRoles={['COLLEGE', 'COLLEGE_ADMIN']}>
              <CollegeDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
            path="/auth/admin/dashboard" 
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

        
       
        <Route 
          path="/auth/faculty/dashboard" 
          element={
            <PrivateRoute allowedRoles={['FACULTY']}>
              <FacultyDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Protected Routes - Admin (if you have it) */}
        {/* <Route 
          path="/auth/admin/dashboard" 
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        /> */}
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
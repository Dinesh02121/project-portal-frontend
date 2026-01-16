import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const [authState, setAuthState] = useState({
    loading: true,
    role: null,
    error: null
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const verifyAndRedirect = async () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔀 DASHBOARD REDIRECT - Checking user role...');
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const userRole = String(data.role).toUpperCase().trim();
          
          console.log('✅ User authenticated');
          console.log('👤 Role detected:', userRole);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          setAuthState({
            loading: false,
            role: userRole,
            error: null
          });
        } else {
          console.log('❌ Authentication failed - redirecting to login');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          setAuthState({
            loading: false,
            role: null,
            error: 'Not authenticated'
          });
        }
      } catch (error) {
        console.error('❌ Error verifying authentication:', error);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        setAuthState({
          loading: false,
          role: null,
          error: 'Verification failed'
        });
      }
    };

    verifyAndRedirect();
  }, [API_BASE_URL]);

  // Show loading spinner while checking
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we prepare your workspace...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (authState.error) {
    console.log('→ Redirecting to login due to error:', authState.error);
    return <Navigate to="/auth/login" state={{ error: 'Please login to continue' }} replace />;
  }

  // Redirect based on role
  console.log('→ Redirecting to appropriate dashboard for role:', authState.role);
  
  switch (authState.role) {
    case 'STUDENT':
      console.log('→ Navigating to /student/dashboard');
      return <Navigate to="/student/dashboard" replace />;
      
    case 'FACULTY':
    case 'TEACHER':
      console.log('→ Navigating to /faculty/dashboard');
      return <Navigate to="/faculty/dashboard" replace />;
      
    case 'COLLEGE':
    case 'COLLEGE_ADMIN':
      console.log('→ Navigating to /college/dashboard');
      return <Navigate to="/college/dashboard" replace />;
      
    case 'ADMIN':
    case 'SYSTEM_ADMIN':
      console.log('→ Navigating to /admin/dashboard');
      return <Navigate to="/admin/dashboard" replace />;
      
    default:
      console.log('❌ Unknown role:', authState.role, '- redirecting to login');
      return <Navigate to="/auth/login" state={{ error: 'Invalid user role' }} replace />;
  }
};

export default DashboardRedirect;
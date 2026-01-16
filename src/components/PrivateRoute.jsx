import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    role: null
  });
  
  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    verifyAuthentication();
  }, []);

  const verifyAuthentication = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 PRIVATE ROUTE - VERIFYING AUTH');
    console.log('📍 Current Path:', location.pathname);
    console.log('🎭 Allowed Roles:', allowedRoles);

    try {
      // Call verify endpoint which checks httpOnly cookie
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        credentials: 'include' // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Authentication verified:', data);
        
        const normalizedRole = data.role.toUpperCase().trim();
        console.log('🔄 Normalized Role:', normalizedRole);
        
        // Store role in localStorage for client-side checks
        localStorage.setItem('userRole', normalizedRole);
        
        setAuthState({
          loading: false,
          authenticated: true,
          role: normalizedRole
        });
      } else {
        console.log('❌ Authentication failed - Status:', response.status);
        clearAuthState();
        setAuthState({
          loading: false,
          authenticated: false,
          role: null
        });
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      clearAuthState();
      setAuthState({
        loading: false,
        authenticated: false,
        role: null
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  const clearAuthState = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  };

  // Show loading state
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authState.authenticated || !authState.role) {
    console.log('❌ Not authenticated - redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase().trim());
  const hasAccess = normalizedAllowedRoles.includes(authState.role);
  
  console.log('🎫 Access Check:');
  console.log('   User role:', authState.role);
  console.log('   Allowed roles:', normalizedAllowedRoles);
  console.log('   Has access:', hasAccess);

  if (!hasAccess) {
    console.log('❌ Role mismatch - unauthorized');
    clearAuthState();
    return <Navigate to="/auth/login" state={{ from: location, error: 'Unauthorized access' }} replace />;
  }

  console.log('✅ Access granted - rendering protected content');
  return children;
};

export default PrivateRoute;
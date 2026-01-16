import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    role: null,
    error: null
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔒 PRIVATE ROUTE CHECK');
      console.log('📍 Current Path:', location.pathname);
      console.log('🎭 Allowed Roles:', allowedRoles);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          credentials: 'include' // Send httpOnly cookie
        });

        if (response.ok) {
          const data = await response.json();
          const userRole = data.role;

          console.log('✅ Authentication verified via API');
          console.log('👤 User Role:', userRole);

          const normalizedRole = String(userRole).toUpperCase().trim();
          const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase().trim());

          console.log('🔄 Normalized Role:', normalizedRole);
          console.log('✅ Normalized Allowed Roles:', normalizedAllowedRoles);

          const hasAccess = normalizedAllowedRoles.includes(normalizedRole);
          console.log('🎫 Access Check:', hasAccess ? '✓ GRANTED' : '✗ DENIED');

          if (hasAccess) {
            console.log('✅ Access granted - rendering protected content');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            setAuthState({
              loading: false,
              authenticated: true,
              role: normalizedRole,
              error: null
            });
          } else {
            console.log('❌ Role mismatch!');
            console.log('   User role:', normalizedRole);
            console.log('   Allowed roles:', normalizedAllowedRoles);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            setAuthState({
              loading: false,
              authenticated: false,
              role: null,
              error: 'Unauthorized access'
            });
          }
        } else {
          console.log('❌ Authentication failed: Invalid or expired session');
          console.log('→ Redirecting to login');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          setAuthState({
            loading: false,
            authenticated: false,
            role: null,
            error: 'Session expired'
          });
        }
      } catch (error) {
        console.error('❌ Auth verification error:', error);
        console.log('→ Redirecting to login');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        setAuthState({
          loading: false,
          authenticated: false,
          role: null,
          error: 'Authentication check failed'
        });
      }
    };

    verifyAuth();
  }, [location.pathname, allowedRoles, API_BASE_URL]);

  // Show loading spinner while checking auth
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.authenticated) {
    // Clear any stale localStorage data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');

    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location, error: authState.error }} 
        replace 
      />
    );
  }

  // Render protected content if authenticated and authorized
  return children;
};

export default PrivateRoute;
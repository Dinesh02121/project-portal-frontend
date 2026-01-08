import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒 PRIVATE ROUTE CHECK');
  console.log('📍 Current Path:', location.pathname);
  console.log('🎭 Allowed Roles:', allowedRoles);
  console.log('🔑 Token:', token ? '✓ Present' : '✗ Missing');
  console.log('👤 Stored Role:', userRole || '✗ Missing');
  
  if (!token || !userRole) {
    console.log('❌ Authentication failed: Missing credentials');
    console.log('→ Redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  const normalizedRole = userRole.toUpperCase().trim();
  console.log('🔄 Normalized Role:', normalizedRole);
  
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase().trim());
  console.log('✅ Normalized Allowed Roles:', normalizedAllowedRoles);
  
  const hasAccess = normalizedAllowedRoles.includes(normalizedRole);
  console.log('🎫 Access Check:', hasAccess ? '✓ GRANTED' : '✗ DENIED');

  if (!hasAccess) {
    console.log('❌ Role mismatch!');
    console.log('   User role:', normalizedRole);
    console.log('   Allowed roles:', normalizedAllowedRoles);
    console.log('→ Clearing session and redirecting to login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    
    return <Navigate to="/auth/login" state={{ from: location, error: 'Unauthorized access' }} replace />;
  }
  
  console.log('✅ Access granted - rendering protected content');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return children;
};

export default PrivateRoute;
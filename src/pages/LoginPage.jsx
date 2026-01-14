import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const hasRedirected = useRef(false);
  const isRedirecting = useRef(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const redirectBasedOnRole = (role) => {
    if (isRedirecting.current) {
      return;
    }
    
    isRedirecting.current = true;
    const normalizedRole = String(role).toUpperCase().trim();
    
    const savedToken = localStorage.getItem('authToken');
    const savedRole = localStorage.getItem('userRole');
    
    if (!savedToken || !savedRole) {
      localStorage.setItem('authToken', localStorage.getItem('authToken') || savedToken);
      localStorage.setItem('userRole', normalizedRole);
    }
    
    switch (normalizedRole) {
      case 'ADMIN':
      case 'SYSTEM_ADMIN':
        window.location.href = '/auth/admin/dashboard';
        break;
      case 'COLLEGE_ADMIN':
      case 'COLLEGE':
      case 'COLLEGEADMIN':
        window.location.href = '/auth/college/dashboard';
        break;
      case 'FACULTY':
      case 'TEACHER':
        window.location.href = '/auth/faculty/dashboard';
        break;
      case 'STUDENT':
        window.location.href = '/auth/student/dashboard';
        break;
      default:
        setError(`Unknown role: ${normalizedRole}. Please contact support.`);
        isRedirecting.current = false;
    }
  };

  useEffect(() => {
    if (hasRedirected.current) {
      return;
    }
    
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token && role) {
      hasRedirected.current = true;
      redirectBasedOnRole(role);
    }
  }, []);

  const handleSubmit = async () => {
    if (isRedirecting.current) {
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = loginType === 'admin' ? '/auth/loginAdmin' : '/auth/login';
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Login failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      const token = data.token;
      const role = data.role;
      const email = data.email;
      const message = data.message;
      
      if (!token) {
        throw new Error('No authentication token received from server');
      }
      
      if (!role) {
        throw new Error('No role information received from server');
      }
      
      const normalizedRole = String(role).toUpperCase().trim();
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', normalizedRole);
      
      const userObj = {
        email: email,
        role: normalizedRole
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      
      setSuccess(message || 'Login successful! Redirecting...');
      
      hasRedirected.current = true;
      redirectBasedOnRole(normalizedRole);
        
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
      setLoading(false);
      isRedirecting.current = false;
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (hasRedirected.current || isRedirecting.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Project Portal</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Log in to your Account
            </h1>
            <p className="text-gray-500 text-sm">
              Welcome back! Please enter your credentials:
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {/* Login Type Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('user')}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginType === 'user'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <User className="inline-block w-4 h-4 mr-2" />
              User Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginType === 'admin'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Lock className="inline-block w-4 h-4 mr-2" />
              Admin Login
            </button>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => window.location.href = '/auth/forgot-password'}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                'Log In'
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={() => window.location.href = '/auth/register'}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
              disabled={loading}
            >
              Create an account
            </button>
          </p>
        </div>

        {/* Right Side - Campus Image */}
        <div className="w-full md:w-1/2 relative overflow-hidden">
          <img 
            src="/ProjectPortalLoginImage.png" 
            alt="Project Portal Campus"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Overlay Text */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <div className="mb-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                PROJECT PORTAL
              </h2>
              <p className="text-lg md:text-xl text-blue-200 mb-2">
                Submit, Review, Innovate
              </p>
            </div>
            <p className="text-white/90 text-sm md:text-base">
              Everything you need for project management in an easily customizable platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

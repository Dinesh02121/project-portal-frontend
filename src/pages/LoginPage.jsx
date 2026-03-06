import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, BookOpen, Users, Shield } from 'lucide-react';

export default function LoginPage() {
  const hasRedirected = useRef(false);
  const isRedirecting = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const redirectBasedOnRole = (role) => {
    if (isRedirecting.current) return;
    isRedirecting.current = true;
    const normalizedRole = String(role).toUpperCase().trim();
    switch (normalizedRole) {
      case 'ADMIN':
      case 'SYSTEM_ADMIN':
        window.location.href = '/auth/admin/dashboard'; break;
      case 'COLLEGE_ADMIN':
      case 'COLLEGE':
      case 'COLLEGEADMIN':
        window.location.href = '/auth/college/dashboard'; break;
      case 'FACULTY':
      case 'TEACHER':
        window.location.href = '/auth/faculty/dashboard'; break;
      case 'STUDENT':
        window.location.href = '/auth/student/dashboard'; break;
      default:
        setError(`Unknown role: ${normalizedRole}. Please contact support.`);
        isRedirecting.current = false;
    }
  };

  useEffect(() => {
    if (hasRedirected.current) return;
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      hasRedirected.current = true;
      redirectBasedOnRole(role);
    }
  }, []);

  const handleSubmit = async () => {
    if (isRedirecting.current) return;
    if (!formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError(''); setSuccess('');
    const endpoint = activeTab === 'admin' ? '/auth/loginAdmin' : '/auth/login';
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Login failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!data.token) throw new Error('No authentication token received from server');
      if (!data.role) throw new Error('No role information received from server');
      const normalizedRole = String(data.role).toUpperCase().trim();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', normalizedRole);
      localStorage.setItem('user', JSON.stringify({ email: data.email, role: normalizedRole }));
      setSuccess(data.message || 'Login successful! Redirecting...');
      hasRedirected.current = true;
      redirectBasedOnRole(normalizedRole);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
      isRedirecting.current = false;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSubmit(); };

  if (hasRedirected.current || isRedirecting.current) {
    return (
      <div style={styles.redirectScreen}>
        <div style={styles.spinner} />
        <p style={{ color: '#6b7280', marginTop: 16 }}>Redirecting...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; }
        .feature-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
        .tab-btn { flex: 1; padding: 12px 20px; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 500; border-radius: 12px; transition: all 0.2s; }
        .tab-btn.active { background: white; color: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
        .tab-btn.inactive { background: transparent; color: #94a3b8; }
        .tab-btn.inactive:hover { color: #64748b; }
        .input-field { width: 100%; padding: 14px 16px 14px 44px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 15px; color: #1e293b; background: #f8fafc; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(59,130,246,0.3); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.4); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .link-btn { background: none; border: none; color: #3b82f6; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .link-btn:hover { color: #2563eb; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Left Panel */}
      <div style={styles.leftPanel}>
        {/* Decorative blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.blob3} />

        <div style={styles.leftContent}>
          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <BookOpen size={28} color="white" />
            </div>
            <div>
              <div style={styles.logoName}>ShareXConnect</div>
              <div style={styles.logoSub}>Academic Excellence Platform</div>
            </div>
          </div>

          {/* Features */}
          <div style={styles.featuresArea}>
            <div className="feature-item">
              <div style={{ ...styles.featureIcon, background: 'rgba(59,130,246,0.15)' }}>
                <BookOpen size={22} color="#3b82f6" />
              </div>
              <div>
                <div style={styles.featureTitle}>Project Management</div>
                <div style={styles.featureDesc}>Create, organize, and manage academic projects with powerful tools designed for educational excellence.</div>
              </div>
            </div>
            <div className="feature-item">
              <div style={{ ...styles.featureIcon, background: 'rgba(16,185,129,0.15)' }}>
                <Users size={22} color="#10b981" />
              </div>
              <div>
                <div style={styles.featureTitle}>Team Collaboration</div>
                <div style={styles.featureDesc}>Connect with peers, share resources, and collaborate seamlessly across academic projects and research.</div>
              </div>
            </div>
            <div className="feature-item">
              <div style={{ ...styles.featureIcon, background: 'rgba(139,92,246,0.15)' }}>
                <Shield size={22} color="#8b5cf6" />
              </div>
              <div>
                <div style={styles.featureTitle}>Faculty Reviews</div>
                <div style={styles.featureDesc}>Secure review system with detailed feedback, grading, and professional academic assessment tools.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard} className="fade-in">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={styles.formLogo}>
              <BookOpen size={32} color="white" />
            </div>
            <h1 style={styles.formTitle}>Welcome to<br />ShareXConnect</h1>
            <p style={styles.formSubtitle}>Your Academic Excellence Platform</p>
          </div>

          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button
              className={`tab-btn ${activeTab === 'signin' ? 'active' : 'inactive'}`}
              onClick={() => { setActiveTab('signin'); setError(''); }}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              className={`tab-btn ${activeTab === 'admin' ? 'active' : 'inactive'}`}
              onClick={() => { setActiveTab('admin'); setError(''); }}
              disabled={loading}
            >
              Admin Login
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: 13, color: '#dc2626' }}>⚠ {error}</span>
            </div>
          )}
          {success && (
            <div style={styles.successBox}>
              <span style={{ fontSize: 13, color: '#16a34a' }}>✓ {success}</span>
            </div>
          )}

          {/* Form Fields */}
          <div style={{ marginTop: 20 }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <Mail size={15} color="#3b82f6" style={{ marginRight: 6 }} />
                Username or Email
              </label>
              <div style={styles.inputWrap}>
                <Mail size={16} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  placeholder="username or email@university.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="input-field"
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <Lock size={15} color="#3b82f6" style={{ marginRight: 6 }} />
                Password
              </label>
              <div style={styles.inputWrap}>
                <Lock size={16} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="input-field"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => window.location.href = '/auth/forgot-password'}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                Forgot password?
              </button>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Signing in...
                </>
              ) : (
                `Sign In to ShareXConnect`
              )}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{ height: 1, background: '#e2e8f0', marginBottom: 16 }} />
            <p style={{ fontSize: 14, color: '#94a3b8' }}>New to ShareXConnect?</p>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
              Don't have an account?{' '}
              <button
                className="link-btn"
                onClick={() => window.location.href = '/auth/register'}
                disabled={loading}
              >
                Create your account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Outfit', sans-serif",
  },
  redirectScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  leftPanel: {
    flex: '0 0 58%',
    background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    padding: '60px 80px',
  },
  blob1: {
    position: 'absolute', width: 400, height: 400,
    background: 'radial-gradient(circle, rgba(147,197,253,0.5) 0%, transparent 70%)',
    top: -100, left: -100, borderRadius: '50%',
  },
  blob2: {
    position: 'absolute', width: 350, height: 350,
    background: 'radial-gradient(circle, rgba(196,181,253,0.4) 0%, transparent 70%)',
    bottom: -80, right: 100, borderRadius: '50%',
  },
  blob3: {
    position: 'absolute', width: 250, height: 250,
    background: 'radial-gradient(circle, rgba(249,168,212,0.35) 0%, transparent 70%)',
    bottom: 100, left: 200, borderRadius: '50%',
  },
  leftContent: { position: 'relative', zIndex: 1, maxWidth: 480 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 64 },
  logoIcon: {
    width: 56, height: 56,
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(59,130,246,0.35)',
  },
  logoName: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
  logoSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  featuresArea: { paddingLeft: 8 },
  featureIcon: {
    width: 48, height: 48, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: { fontSize: 17, fontWeight: 600, color: '#1e293b', marginBottom: 6 },
  featureDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  rightPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 40px',
  },
  formCard: {
    background: 'white',
    borderRadius: 24,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
  },
  formLogo: {
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
  },
  formTitle: { fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1.3, marginBottom: 8 },
  formSubtitle: { fontSize: 14, color: '#94a3b8' },
  tabContainer: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 10, padding: '10px 14px', marginBottom: 12,
  },
  successBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 10, padding: '10px 14px', marginBottom: 12,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    display: 'flex', alignItems: 'center',
    fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8,
  },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  eyeBtn: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
    display: 'flex', alignItems: 'center',
  },
};

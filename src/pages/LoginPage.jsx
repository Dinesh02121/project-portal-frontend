import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, BookOpen, Users, Shield } from 'lucide-react';

export default function LoginPage() {
  const hasRedirected = useRef(false);
  const isRedirecting = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' | 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const redirectBasedOnRole = (role) => {
    if (isRedirecting.current) return;
    isRedirecting.current = true;
    const r = String(role).toUpperCase().trim();
    switch (r) {
      case 'ADMIN':
      case 'SYSTEM_ADMIN':        window.location.href = '/auth/admin/dashboard';   break;
      case 'COLLEGE_ADMIN':
      case 'COLLEGE':
      case 'COLLEGEADMIN':        window.location.href = '/auth/college/dashboard'; break;
      case 'FACULTY':
      case 'TEACHER':             window.location.href = '/auth/faculty/dashboard'; break;
      case 'STUDENT':             window.location.href = '/auth/student/dashboard'; break;
      default:
        setError(`Unknown role: ${r}. Please contact support.`);
        isRedirecting.current = false;
    }
  };

  useEffect(() => {
    if (hasRedirected.current) return;
    const token = localStorage.getItem('authToken');
    const role  = localStorage.getItem('userRole');
    if (token && role) { hasRedirected.current = true; redirectBasedOnRole(role); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (isRedirecting.current) return;
    if (!formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError(''); setSuccess('');
    const endpoint = loginType === 'admin' ? '/auth/loginAdmin' : '/auth/login';
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Login failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!data.token) throw new Error('No authentication token received from server');
      if (!data.role)  throw new Error('No role information received from server');
      const normalizedRole = String(data.role).toUpperCase().trim();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', normalizedRole);
      localStorage.setItem('user', JSON.stringify({ email: data.email, role: normalizedRole }));
      setSuccess(data.message || 'Login successful! Redirecting...');
      hasRedirected.current = true;
      redirectBasedOnRole(normalizedRole);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
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
        <svg style={styles.spinSvg} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
        <p style={{ color: '#6b7280', marginTop: 16, fontFamily: 'Outfit, sans-serif', fontSize: 15 }}>
          Redirecting...
        </p>
      </div>
    );
  }

  const features = [
    { icon: <BookOpen size={20} color="#3b82f6" />, bg: 'rgba(59,130,246,0.14)', title: 'Project Management',  desc: 'Create, organize, and manage academic projects with powerful tools designed for educational excellence.' },
    { icon: <Users  size={20} color="#10b981" />, bg: 'rgba(16,185,129,0.14)',  title: 'Team Collaboration',  desc: 'Connect with peers, share resources, and collaborate seamlessly across academic projects.' },
    { icon: <Shield size={20} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.14)',  title: 'Faculty Reviews',     desc: 'Secure review system with detailed feedback, grading, and professional assessment tools.' },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { font-family: 'Outfit', sans-serif; }

        /* ── Layout ── */
        .login-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Outfit', sans-serif;
        }

        /* Left panel — hidden on mobile */
        .left-panel {
          flex: 0 0 56%;
          background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 55%, #fce7f3 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center;
          padding: 60px 72px;
        }

        /* Right panel */
        .right-panel {
          flex: 1;
          background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 40px 32px;
        }

        .form-card {
          background: white;
          border-radius: 24px;
          padding: 40px 36px;
          width: 100%; max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }

        /* ── Inputs ── */
        .input-field {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-family: 'Outfit', sans-serif; font-size: 16px; color: #1e293b;
          background: #f8fafc; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none; appearance: none;
        }
        .input-field:focus {
          border-color: #3b82f6; background: white;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Tabs ── */
        .tab-row {
          display: flex;
          background: #f1f5f9;
          border-radius: 12px; padding: 4px;
          margin-bottom: 22px; gap: 4px;
        }
        .tab-btn {
          flex: 1; padding: 11px 10px; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500;
          border-radius: 9px; transition: all 0.18s;
          -webkit-tap-highlight-color: transparent;
        }
        .tab-btn.active  { background: white; color: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-weight: 700; }
        .tab-btn.inactive { background: transparent; color: #94a3b8; }
        .tab-btn.inactive:hover { color: #64748b; }

        /* ── Submit ── */
        .submit-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white; border: none; border-radius: 13px;
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(59,130,246,0.32);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(59,130,246,0.42); }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* ── Animations ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.75s linear infinite; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        /* ── Feature items ── */
        .feature-item {
          display: flex; align-items: flex-start; gap: 15px;
          margin-bottom: 28px;
        }

        /* ══════════════════════════════════════
           MOBILE  ≤ 768px
           Left panel hidden; card fills screen
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          .left-panel { display: none; }

          .right-panel {
            background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 55%, #fce7f3 100%);
            padding: 24px 16px 40px;
            align-items: flex-start;
            min-height: 100vh;
          }

          .form-card {
            border-radius: 20px;
            padding: 28px 20px 24px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
            margin-top: 12px;
          }

          .input-field { font-size: 16px; padding: 14px 16px 14px 43px; }
          .submit-btn  { font-size: 15px; padding: 15px; }
          .tab-btn     { font-size: 13px; padding: 10px 8px; }
        }

        @media (max-width: 380px) {
          .right-panel { padding: 16px 12px 32px; }
          .form-card   { padding: 24px 16px 20px; }
        }
      `}</style>

      {/* ══ LEFT PANEL (desktop only) ══ */}
      <div className="left-panel">
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.blob3} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <BookOpen size={26} color="white" />
            </div>
            <div>
              <div style={styles.logoName}>ShareXConnect</div>
              <div style={styles.logoSub}>Academic Excellence Platform</div>
            </div>
          </div>

          {/* Features */}
          {features.map(f => (
            <div key={f.title} className="feature-item">
              <div style={{ ...styles.featureIcon, background: f.bg }}>{f.icon}</div>
              <div>
                <div style={styles.featureTitle}>{f.title}</div>
                <div style={styles.featureDesc}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="right-panel">
        <div className="form-card fade-up">

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={styles.formLogo}>
              <BookOpen size={28} color="white" />
            </div>
            <h1 style={styles.formTitle}>Welcome to<br />ShareXConnect</h1>
            <p style={styles.formSubtitle}>Your Academic Excellence Platform</p>
          </div>

          {/* Tabs */}
          <div className="tab-row">
            <button
              className={`tab-btn ${loginType === 'user' ? 'active' : 'inactive'}`}
              onClick={() => { setLoginType('user'); setError(''); }}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              className={`tab-btn ${loginType === 'admin' ? 'active' : 'inactive'}`}
              onClick={() => { setLoginType('admin'); setError(''); }}
              disabled={loading}
            >
              Admin Login
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: 13, color: '#dc2626', lineHeight: 1.4 }}>⚠ {error}</span>
            </div>
          )}
          {success && (
            <div style={styles.successBox}>
              <span style={{ fontSize: 13, color: '#16a34a', lineHeight: 1.4 }}>✓ {success}</span>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>
              <Mail size={13} color="#3b82f6" style={{ marginRight: 6 }} />
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
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 10 }}>
            <label style={styles.label}>
              <Lock size={13} color="#3b82f6" style={{ marginRight: 6 }} />
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
                style={{ paddingRight: 46 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={styles.eyeBtn}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => window.location.href = '/auth/forgot-password'}
              disabled={loading}
              style={styles.textBtn}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <svg className="spin" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Signing in...
              </>
            ) : 'Sign In to ShareXConnect'}
          </button>

          {/* Register link */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 5 }}>New to ShareXConnect?</p>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              Don't have an account?{' '}
              <button
                onClick={() => window.location.href = '/auth/register'}
                disabled={loading}
                style={{ ...styles.textBtn, textDecoration: 'underline' }}
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
  page: { minHeight: '100vh', display: 'flex', fontFamily: "'Outfit', sans-serif" },
  redirectScreen: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: '#f8fafc',
  },
  spinSvg: { width: 48, height: 48, animation: 'spin 0.8s linear infinite' },

  /* Left panel decorative blobs */
  blob1: { position: 'absolute', width: 420, height: 420, borderRadius: '50%', top: -120, left: -100, background: 'radial-gradient(circle, rgba(147,197,253,0.5) 0%, transparent 70%)' },
  blob2: { position: 'absolute', width: 360, height: 360, borderRadius: '50%', bottom: -80, right: 80,  background: 'radial-gradient(circle, rgba(196,181,253,0.4) 0%, transparent 70%)' },
  blob3: { position: 'absolute', width: 250, height: 250, borderRadius: '50%', bottom: 110, left: 180, background: 'radial-gradient(circle, rgba(249,168,212,0.35) 0%, transparent 70%)' },

  logoRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 },
  logoIcon: { width: 54, height: 54, borderRadius: 15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 8px 20px rgba(59,130,246,0.35)' },
  logoName: { fontSize: 21, fontWeight: 700, color: '#1e293b' },
  logoSub:  { fontSize: 12.5, color: '#64748b', marginTop: 2 },
  featureIcon: { width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 },
  featureDesc:  { fontSize: 13.5, color: '#64748b', lineHeight: 1.55 },

  formLogo: { width: 60, height: 60, borderRadius: 17, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 22px rgba(59,130,246,0.3)' },
  formTitle:    { fontSize: 23, fontWeight: 800, color: '#1e293b', lineHeight: 1.3, marginBottom: 6 },
  formSubtitle: { fontSize: 13, color: '#94a3b8' },

  errorBox:   { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 13px', marginBottom: 14 },
  successBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 13px', marginBottom: 14 },

  label:     { display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  eyeBtn:    { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent' },
  textBtn:   { background: 'none', border: 'none', color: '#3b82f6', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', WebkitTapHighlightColor: 'transparent' },
};

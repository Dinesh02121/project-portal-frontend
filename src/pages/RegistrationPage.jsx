import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Building, BookOpen, AlertCircle } from 'lucide-react';

export default function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    academicRole: 'student',
    collegeId: '',
    collegeName: '',
    department: '',
    rollNo: '',
    branch: '',
    semester: '',
    password: '',
    confirmPassword: '',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchColleges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchColleges = async () => {
    setLoadingColleges(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/colleges`);
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (err) {
      console.error('Error fetching colleges:', err);
    } finally {
      setLoadingColleges(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields'); return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters'); return false;
    }
    if (formData.academicRole === 'student' && (!formData.rollNo || !formData.branch || !formData.semester || !formData.collegeId)) {
      setError('Please fill in all student fields'); return false;
    }
    if (formData.academicRole === 'faculty' && (!formData.department || !formData.collegeName)) {
      setError('Please fill in all faculty fields'); return false;
    }
    if (formData.academicRole === 'college_admin' && !formData.collegeName) {
      setError('Please enter your college name'); return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true); setError('');
    try {
      let endpoint = '';
      let body = {};
      const selectedCollege = colleges.find(c => c.collegeId === parseInt(formData.collegeId));

      if (formData.academicRole === 'student') {
        endpoint = '/auth/registration/student';
        body = {
          studentName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          branch: formData.branch,
          rollNo: formData.rollNo,
          semester: formData.semester,
          collegeName: selectedCollege?.collegeName || '',
        };
      } else if (formData.academicRole === 'faculty') {
        endpoint = '/auth/registration/faculty';
        body = {
          facultyName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          collegeName: formData.collegeName,
        };
      } else if (formData.academicRole === 'college_admin') {
        endpoint = '/auth/registration/collegeAdmin';
        body = {
          email: formData.email,
          password: formData.password,
          collegeName: formData.collegeName,
        };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Registration failed');
      }

      if (formData.academicRole === 'college_admin') {
        setSuccess(true);
      } else {
        setOtpSent(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setError('Please enter a valid 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const otpEndpoint = formData.academicRole === 'faculty'
        ? '/auth/registration/verify-otp-faculty'
        : '/auth/registration/verify-otp';
      const response = await fetch(`${API_BASE_URL}${otpEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: parseInt(otp) }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'OTP verification failed');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleColor = { student: '#3b82f6', faculty: '#10b981', college_admin: '#8b5cf6' };
  const currentColor = roleColor[formData.academicRole] || '#3b82f6';

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { font-family: 'Outfit', sans-serif; }

        .reg-card {
          position: relative; z-index: 1;
          background: white; border-radius: 24px;
          width: 100%; max-width: 480px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          margin: 0 auto;
        }

        .card-inner {
          padding: 32px 28px 28px;
        }

        .input-field {
          width: 100%;
          padding: 14px 14px 14px 44px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-family: 'Outfit', sans-serif; font-size: 16px; color: #1e293b;
          background: #f8fafc; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none; appearance: none;
        }
        .input-field.no-icon { padding-left: 14px; }
        .input-field:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:disabled { opacity: 0.55; cursor: not-allowed; }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .role-btn {
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 5px;
          padding: 12px 6px;
          border: 2px solid #e2e8f0; border-radius: 12px;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
          color: #64748b; background: white;
          -webkit-tap-highlight-color: transparent;
        }
        .role-btn:active { transform: scale(0.97); }
        .role-btn.sel-student  { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
        .role-btn.sel-faculty  { border-color: #10b981; background: #f0fdf4; color: #065f46; }
        .role-btn.sel-college_admin { border-color: #8b5cf6; background: #faf5ff; color: #5b21b6; }

        .submit-btn {
          width: 100%; padding: 16px;
          color: white; border: none; border-radius: 14px;
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .otp-input {
          width: 100%; padding: 18px 14px;
          text-align: center; font-size: 30px; font-weight: 700; letter-spacing: 14px;
          border: 2px solid #e2e8f0; border-radius: 14px;
          font-family: 'Outfit', sans-serif; color: #1e293b; background: #f8fafc;
          outline: none; transition: all 0.2s;
          -webkit-appearance: none; appearance: none;
        }
        .otp-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.75s linear infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        /* ── Mobile ── */
        @media (max-width: 520px) {
          .reg-card { border-radius: 20px; }
          .card-inner { padding: 24px 18px 24px; }
          .two-col { grid-template-columns: 1fr; gap: 0; }
          .two-col > div + div { margin-top: 14px; }
          .input-field { font-size: 16px; padding: 14px 14px 14px 42px; }
          .input-field.no-icon { padding-left: 14px; }
          .submit-btn { font-size: 15px; padding: 15px; }
          .role-btn { font-size: 11px; padding: 10px 4px; }
        }

        @media (max-width: 360px) {
          .card-inner { padding: 20px 14px 20px; }
          .role-grid { gap: 6px; }
          .role-btn { padding: 9px 2px; font-size: 10px; }
        }
      `}</style>

      {/* Gradient background */}
      <div style={styles.bg} />
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Outer scroll wrapper — lets whole page scroll naturally on mobile */}
      <div style={styles.outer}>
        <div className="reg-card fade-up">
          <div className="card-inner">

            {/* ── Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ ...styles.logoIcon, background: `linear-gradient(135deg, ${currentColor}, ${currentColor}bb)` }}>
                <BookOpen size={26} color="white" />
              </div>
              <h1 style={styles.title}>Create Account</h1>
              <p style={styles.subtitle}>Join ShareXConnect · Academic Excellence Platform</p>
            </div>

            {/* ── Error banner ── */}
            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#dc2626', lineHeight: 1.4 }}>{error}</span>
              </div>
            )}

            {/* ════ SUCCESS ════ */}
            {success ? (
              <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                <div style={styles.successCircle}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Account Created!</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
                  Your account has been created successfully.
                </p>
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="submit-btn"
                  style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}bb)`, boxShadow: `0 4px 14px ${currentColor}50` }}
                >
                  Go to Login
                </button>
              </div>

            ) : otpSent ? (
              /* ════ OTP ════ */
              <div>
                <div style={{ textAlign: 'center', marginBottom: 22 }}>
                  <div style={styles.otpIcon}>📧</div>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                    We've sent a 6-digit OTP to
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginTop: 4, wordBreak: 'break-all' }}>
                    {formData.email}
                  </p>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={styles.label}>Enter OTP</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="6"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); if (error) setError(''); }}
                    disabled={loading}
                    className="otp-input"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="submit-btn"
                  style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}bb)`, boxShadow: `0 4px 14px ${currentColor}50` }}
                >
                  {loading
                    ? <><Spinner /> Verifying...</>
                    : 'Verify OTP'
                  }
                </button>
              </div>

            ) : (
              /* ════ REGISTRATION FORM ════ */
              <div>
                {/* Name row */}
                <div style={{ marginBottom: 14 }} className="two-col">
                  <div>
                    <label style={styles.label}><User size={13} color={currentColor} style={{ marginRight: 5 }} />First Name</label>
                    <div style={styles.wrap}>
                      <User size={15} color="#94a3b8" style={styles.icon} />
                      <input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} disabled={loading} className="input-field" autoComplete="given-name" />
                    </div>
                  </div>
                  <div>
                    <label style={styles.label}><User size={13} color={currentColor} style={{ marginRight: 5 }} />Last Name</label>
                    <div style={styles.wrap}>
                      <User size={15} color="#94a3b8" style={styles.icon} />
                      <input type="text" name="lastName" placeholder="Smith" value={formData.lastName} onChange={handleInputChange} disabled={loading} className="input-field" autoComplete="family-name" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 14 }}>
                  <label style={styles.label}><Mail size={13} color={currentColor} style={{ marginRight: 5 }} />Email Address</label>
                  <div style={styles.wrap}>
                    <Mail size={15} color="#94a3b8" style={styles.icon} />
                    <input type="email" name="email" placeholder="john@university.edu" value={formData.email} onChange={handleInputChange} disabled={loading} className="input-field" autoComplete="email" inputMode="email" />
                  </div>
                </div>

                {/* Academic Role */}
                <div style={{ marginBottom: 16 }}>
                  <label style={styles.label}><BookOpen size={13} color={currentColor} style={{ marginRight: 5 }} />Academic Role</label>
                  <div className="role-grid">
                    {[
                      { value: 'student', label: 'Student', icon: '🎓' },
                      { value: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
                      { value: 'college_admin', label: 'Admin', icon: '🏛️' },
                    ].map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setFormData(p => ({ ...p, academicRole: r.value })); setError(''); }}
                        disabled={loading}
                        className={`role-btn ${formData.academicRole === r.value ? `sel-${r.value}` : ''}`}
                      >
                        <span style={{ fontSize: 22 }}>{r.icon}</span>
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Student fields ── */}
                {formData.academicRole === 'student' && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={styles.label}><Building size={13} color={currentColor} style={{ marginRight: 5 }} />Select Your College</label>
                      <div style={styles.wrap}>
                        <Building size={15} color="#94a3b8" style={styles.icon} />
                        <select name="collegeId" value={formData.collegeId} onChange={handleInputChange} disabled={loading || loadingColleges} className="input-field" style={{ cursor: 'pointer' }}>
                          <option value="">{loadingColleges ? 'Loading colleges…' : 'Select your college'}</option>
                          {colleges.map(c => <option key={c.collegeId} value={c.collegeId}>{c.collegeName}</option>)}
                        </select>
                      </div>
                      <p style={styles.hint}>Your college must be registered by a College Admin first</p>
                    </div>

                    <div style={{ marginBottom: 14 }} className="two-col">
                      <div>
                        <label style={styles.label}>Roll Number</label>
                        <input type="text" name="rollNo" placeholder="Roll no." value={formData.rollNo} onChange={handleInputChange} disabled={loading} className="input-field no-icon" />
                      </div>
                      <div>
                        <label style={styles.label}>Branch</label>
                        <input type="text" name="branch" placeholder="e.g. CSE" value={formData.branch} onChange={handleInputChange} disabled={loading} className="input-field no-icon" />
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={styles.label}>Semester</label>
                      <select name="semester" value={formData.semester} onChange={handleInputChange} disabled={loading} className="input-field no-icon" style={{ cursor: 'pointer' }}>
                        <option value="">Select Semester</option>
                        {['I','II','III','IV','V','VI','VII','VIII'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* ── Faculty fields ── */}
                {formData.academicRole === 'faculty' && (
                  <div style={{ marginBottom: 14 }} className="two-col">
                    <div>
                      <label style={styles.label}><Building size={13} color={currentColor} style={{ marginRight: 5 }} />College</label>
                      <div style={styles.wrap}>
                        <Building size={15} color="#94a3b8" style={styles.icon} />
                        <select name="collegeName" value={formData.collegeName} onChange={handleInputChange} disabled={loading} className="input-field" style={{ cursor: 'pointer' }}>
                          <option value="">Select college</option>
                          {colleges.map(c => <option key={c.collegeId} value={c.collegeName}>{c.collegeName}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={styles.label}>Department</label>
                      <input type="text" name="department" placeholder="e.g. Computer Science" value={formData.department} onChange={handleInputChange} disabled={loading} className="input-field no-icon" />
                    </div>
                  </div>
                )}

                {/* ── Admin fields ── */}
                {formData.academicRole === 'college_admin' && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={styles.label}><Building size={13} color={currentColor} style={{ marginRight: 5 }} />College Name</label>
                    <div style={styles.wrap}>
                      <Building size={15} color="#94a3b8" style={styles.icon} />
                      <input type="text" name="collegeName" placeholder="Enter college name" value={formData.collegeName} onChange={handleInputChange} disabled={loading} className="input-field" />
                    </div>
                    <div style={styles.adminNote}>
                      <p style={{ fontSize: 12, color: '#7c3aed', lineHeight: 1.5 }}>
                        As a college admin, you'll manage faculty, students, and college-wide settings.
                      </p>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div style={{ marginBottom: 14 }}>
                  <label style={styles.label}><Lock size={13} color={currentColor} style={{ marginRight: 5 }} />Password</label>
                  <div style={styles.wrap}>
                    <Lock size={15} color="#94a3b8" style={styles.icon} />
                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a secure password" value={formData.password} onChange={handleInputChange} disabled={loading} className="input-field" style={{ paddingRight: 46 }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} style={styles.eyeBtn} disabled={loading}>
                      {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: 22 }}>
                  <label style={styles.label}><Lock size={13} color={currentColor} style={{ marginRight: 5 }} />Confirm Password</label>
                  <div style={styles.wrap}>
                    <Lock size={15} color="#94a3b8" style={styles.icon} />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} disabled={loading} className="input-field" style={{ paddingRight: 46 }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn} disabled={loading}>
                      {showConfirmPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleRegister}
                  disabled={loading || (formData.academicRole === 'student' && (loadingColleges || colleges.length === 0))}
                  className="submit-btn"
                  style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}bb)`, boxShadow: `0 4px 14px ${currentColor}50` }}
                >
                  {loading
                    ? <><Spinner /> Creating Account…</>
                    : '👤 Create ShareXConnect Account'
                  }
                </button>

                {/* Sign in link */}
                <div style={{ textAlign: 'center', marginTop: 18 }}>
                  <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />
                  <p style={{ fontSize: 14, color: '#64748b' }}>
                    Already have an account?{' '}
                    <button
                      onClick={() => window.location.href = '/auth/login'}
                      style={{ background: 'none', border: 'none', color: currentColor, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', WebkitTapHighlightColor: 'transparent' }}
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>{/* card-inner */}
        </div>{/* reg-card */}
      </div>
    </div>
  );
}

/* Inline spinner so no extra import needed */
function Spinner() {
  return (
    <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: "'Outfit', sans-serif",
    position: 'relative',
    overflowX: 'hidden',
  },
  bg: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 55%, #dcfce7 100%)',
    zIndex: 0,
  },
  blob1: {
    position: 'fixed', width: 480, height: 480,
    background: 'radial-gradient(circle, rgba(147,197,253,0.45) 0%, transparent 70%)',
    top: -160, left: -120, borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 380, height: 380,
    background: 'radial-gradient(circle, rgba(196,181,253,0.38) 0%, transparent 70%)',
    bottom: -100, right: -60, borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
  },
  outer: {
    position: 'relative', zIndex: 1,
    minHeight: '100vh',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '24px 16px 40px',
  },
  logoIcon: {
    width: 58, height: 58, borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
    boxShadow: '0 8px 22px rgba(59,130,246,0.28)',
    transition: 'background 0.3s',
  },
  title: { fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 5 },
  subtitle: { fontSize: 12.5, color: '#94a3b8', lineHeight: 1.4 },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 10, padding: '11px 13px',
    display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16,
  },
  label: {
    display: 'flex', alignItems: 'center',
    fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7,
  },
  hint: { fontSize: 11, color: '#94a3b8', marginTop: 5, lineHeight: 1.4 },
  wrap: { position: 'relative' },
  icon: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 6,
    display: 'flex', alignItems: 'center',
    WebkitTapHighlightColor: 'transparent',
  },
  adminNote: {
    background: '#faf5ff', border: '1px solid #e9d5ff',
    borderRadius: 10, padding: '10px 13px', marginTop: 10,
  },
  successCircle: {
    width: 66, height: 66, background: '#f0fdf4', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  otpIcon: { fontSize: 36, marginBottom: 12 },
};

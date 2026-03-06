import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Building, BookOpen, AlertCircle, AtSign } from 'lucide-react';

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState('signin');
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
    username: '',
    email: '',
    institution: '',
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

  const roleColor = {
    student: '#3b82f6',
    faculty: '#10b981',
    college_admin: '#8b5cf6',
  };

  const currentColor = roleColor[formData.academicRole] || '#3b82f6';

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; }
        .tab-btn { flex: 1; padding: 12px 16px; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; border-radius: 10px; transition: all 0.2s; }
        .tab-btn.active { background: white; color: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.12); font-weight: 600; }
        .tab-btn.inactive { background: transparent; color: #94a3b8; }
        .tab-btn.inactive:hover { color: #64748b; }
        .input-field { width: 100%; padding: 13px 14px 13px 42px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e293b; background: #f8fafc; outline: none; transition: all 0.2s; }
        .input-field.no-icon { padding-left: 14px; }
        .input-field:focus { border-color: var(--focus-color, #3b82f6); background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn { width: 100%; padding: 14px; color: white; border: none; border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .otp-input { width: 100%; padding: 16px; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: 'Outfit', sans-serif; color: #1e293b; background: #f8fafc; outline: none; transition: all 0.2s; }
        .otp-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .role-option { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; color: #374151; background: white; }
        .role-option:hover { border-color: #94a3b8; }
        .role-option.selected-student { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
        .role-option.selected-faculty { border-color: #10b981; background: #f0fdf4; color: #065f46; }
        .role-option.selected-college_admin { border-color: #8b5cf6; background: #faf5ff; color: #4c1d95; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
      `}</style>

      {/* Gradient background */}
      <div style={styles.bgGradient} />
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card} className="fade-up">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ ...styles.logoIcon, background: `linear-gradient(135deg, ${currentColor}, ${currentColor}cc)` }}>
            <BookOpen size={28} color="white" />
          </div>
          <h1 style={styles.title}>Welcome to<br />ShareXConnect</h1>
          <p style={styles.subtitle}>Your Academic Excellence Platform</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabContainer}>
          <button
            className={`tab-btn ${activeTab === 'signin' ? 'active' : 'inactive'}`}
            onClick={() => { setActiveTab('signin'); window.location.href = '/auth/login'; }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Account Created!</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Your account has been created successfully.</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="submit-btn"
              style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}cc)`, boxShadow: `0 4px 15px ${currentColor}40` }}
            >
              Go to Login
            </button>
          </div>
        ) : otpSent ? (
          /* OTP Verification */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#64748b' }}>We've sent a 6-digit OTP to</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{formData.email}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="otp-input"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="submit-btn"
              style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}cc)`, boxShadow: `0 4px 15px ${currentColor}40` }}
            >
              {loading ? <><svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Verifying...</> : 'Verify OTP'}
            </button>
          </div>
        ) : (
          /* Registration Form */
          <div style={{ overflowY: 'auto', maxHeight: '55vh', paddingRight: 4 }}>
            {/* Name Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={styles.label}><User size={14} color={currentColor} style={{ marginRight: 5 }} />First Name</label>
                <div style={styles.inputWrap}>
                  <User size={15} color="#94a3b8" style={styles.inputIcon} />
                  <input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} disabled={loading} className="input-field" />
                </div>
              </div>
              <div>
                <label style={styles.label}><User size={14} color={currentColor} style={{ marginRight: 5 }} />Last Name</label>
                <div style={styles.inputWrap}>
                  <User size={15} color="#94a3b8" style={styles.inputIcon} />
                  <input type="text" name="lastName" placeholder="Smith" value={formData.lastName} onChange={handleInputChange} disabled={loading} className="input-field" />
                </div>
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}><AtSign size={14} color={currentColor} style={{ marginRight: 5 }} />Username</label>
              <div style={styles.inputWrap}>
                <AtSign size={15} color="#94a3b8" style={styles.inputIcon} />
                <input type="text" name="username" placeholder="johnsmith" value={formData.username} onChange={handleInputChange} disabled={loading} className="input-field" />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}><Mail size={14} color={currentColor} style={{ marginRight: 5 }} />Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={15} color="#94a3b8" style={styles.inputIcon} />
                <input type="email" name="email" placeholder="john.smith@university.edu" value={formData.email} onChange={handleInputChange} disabled={loading} className="input-field" />
              </div>
            </div>

            {/* Academic Role */}
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}>
                <BookOpen size={14} color={currentColor} style={{ marginRight: 5 }} />
                Academic Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { value: 'student', label: 'Student', icon: '🎓' },
                  { value: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
                  { value: 'college_admin', label: 'Admin', icon: '🏛️' },
                ].map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => { setFormData(p => ({ ...p, academicRole: role.value })); setError(''); }}
                    disabled={loading}
                    className={`role-option ${formData.academicRole === role.value ? `selected-${role.value}` : ''}`}
                    style={{ justifyContent: 'center', flexDirection: 'column', gap: 4 }}
                  >
                    <span style={{ fontSize: 20 }}>{role.icon}</span>
                    <span style={{ fontSize: 12 }}>{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* College Selection for Student */}
            {formData.academicRole === 'student' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={styles.label}><Building size={14} color={currentColor} style={{ marginRight: 5 }} />Select Your College</label>
                  <div style={styles.inputWrap}>
                    <Building size={15} color="#94a3b8" style={styles.inputIcon} />
                    <select name="collegeId" value={formData.collegeId} onChange={handleInputChange} disabled={loading || loadingColleges} className="input-field" style={{ appearance: 'none', cursor: 'pointer' }}>
                      <option value="">{loadingColleges ? 'Loading...' : 'Select your college'}</option>
                      {colleges.map(c => <option key={c.collegeId} value={c.collegeId}>{c.collegeName}</option>)}
                    </select>
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Your college must be registered by a College Admin before you can sign up</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
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
                  <select name="semester" value={formData.semester} onChange={handleInputChange} disabled={loading} className="input-field no-icon" style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select Semester</option>
                    {['I','II','III','IV','V','VI','VII','VIII'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Faculty Fields */}
            {formData.academicRole === 'faculty' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={styles.label}><Building size={14} color={currentColor} style={{ marginRight: 5 }} />College</label>
                  <div style={styles.inputWrap}>
                    <Building size={15} color="#94a3b8" style={styles.inputIcon} />
                    <select name="collegeName" value={formData.collegeName} onChange={handleInputChange} disabled={loading} className="input-field" style={{ appearance: 'none' }}>
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

            {/* Admin Fields */}
            {formData.academicRole === 'college_admin' && (
              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}><Building size={14} color={currentColor} style={{ marginRight: 5 }} />College Name</label>
                <div style={styles.inputWrap}>
                  <Building size={15} color="#94a3b8" style={styles.inputIcon} />
                  <input type="text" name="collegeName" placeholder="Enter college name" value={formData.collegeName} onChange={handleInputChange} disabled={loading} className="input-field" />
                </div>
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
                  <p style={{ fontSize: 12, color: '#7c3aed' }}>As a college admin, you'll manage faculty, students, and college-wide settings.</p>
                </div>
              </div>
            )}

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}><Lock size={14} color={currentColor} style={{ marginRight: 5 }} />Password</label>
              <div style={styles.inputWrap}>
                <Lock size={15} color="#94a3b8" style={styles.inputIcon} />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a secure password" value={formData.password} onChange={handleInputChange} disabled={loading} className="input-field" style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} disabled={loading}>
                  {showPassword ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={styles.label}><Lock size={14} color={currentColor} style={{ marginRight: 5 }} />Confirm Password</label>
              <div style={styles.inputWrap}>
                <Lock size={15} color="#94a3b8" style={styles.inputIcon} />
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} disabled={loading} className="input-field" style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn} disabled={loading}>
                  {showConfirmPassword ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || (formData.academicRole === 'student' && (loadingColleges || colleges.length === 0))}
              className="submit-btn"
              style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}cc)`, boxShadow: `0 4px 15px ${currentColor}40` }}
            >
              {loading
                ? <><svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Creating Account...</>
                : <>👤 Create ShareXConnect Account</>
              }
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ height: 1, background: '#e2e8f0', marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: '#64748b' }}>
                Already have an account?{' '}
                <button
                  style={{ background: 'none', border: 'none', color: currentColor, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                  onClick={() => window.location.href = '/auth/login'}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    position: 'relative',
    padding: '20px',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)',
  },
  bgGradient: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #dcfce7 100%)',
    zIndex: 0,
  },
  blob1: {
    position: 'fixed', width: 500, height: 500,
    background: 'radial-gradient(circle, rgba(147,197,253,0.4) 0%, transparent 70%)',
    top: -150, left: -100, borderRadius: '50%', zIndex: 0,
  },
  blob2: {
    position: 'fixed', width: 400, height: 400,
    background: 'radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%)',
    bottom: -100, right: -50, borderRadius: '50%', zIndex: 0,
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'white',
    borderRadius: 24,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  },
  logoIcon: {
    width: 60, height: 60,
    borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
    transition: 'background 0.3s',
  },
  title: { fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1.3, marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#94a3b8' },
  tabContainer: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 8, padding: '10px 12px',
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 14,
  },
  label: {
    display: 'flex', alignItems: 'center',
    fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
  },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
    display: 'flex', alignItems: 'center',
  },
};

import React, { useState, useEffect } from 'react';
import { Building2, Users, GraduationCap, UserCheck, Menu, X, LogOut, Search, Edit, Mail, AlertCircle, CheckCircle, Globe, Phone, MapPin, FileText, TrendingUp, Clock, ChevronRight, Award, BookOpen } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Auth Token Manager (using in-memory storage)
const AuthManager = {
  token: null,
  
  setToken: (token) => {
    AuthManager.token = token;
  },
  
  getToken: () => {
    return AuthManager.token;
  },
  
  clearToken: () => {
    AuthManager.token = null;
  }
};

// College Registration Modal
const CollegeRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    collegeName: '',
    officialDomain: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.collegeName.trim()) {
      setError('College name is required');
      return;
    }
    if (!formData.officialDomain.trim()) {
      setError('Official domain is required');
      return;
    }

    setLoading(true);

    try {
      const token = AuthManager.getToken();
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/college/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          collegeName: formData.collegeName,
          officialDomain: formData.officialDomain,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          phone: formData.phone,
          status: 'PENDING'
        })
      });

      if (response.ok) {
        const message = await response.text().catch(() => 'College registered successfully!');
        setSuccess(message || 'College registered successfully! Status: PENDING (awaiting admin approval)');
        setFormData({ 
          collegeName: '', 
          officialDomain: '', 
          address: '',
          city: '',
          state: '',
          pincode: '',
          phone: '',
          status: 'PENDING' 
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const errorText = await response.text().catch(() => 'Failed to register college');
        setError(errorText || 'Failed to register college. Please check all fields.');
      }
    } catch (err) {
      console.error('Error registering college:', err);
      setError(`Network error: ${err.message}. Please ensure the backend is running on ${API_BASE_URL} and CORS is enabled.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Register College</h3>
            <p className="text-sm text-slate-500 mt-1">Registration will be pending until admin approval</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">College Name *</label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter college name"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Official Domain *</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="officialDomain"
                  value={formData.officialDomain}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="example.edu"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Street address"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="City"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="State"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Pincode"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Phone number"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Your college registration will be in PENDING status until approved by an administrator.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register College'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Profile Modal
const EditProfileModal = ({ isOpen, onClose, onSuccess, profileData }) => {
  const [formData, setFormData] = useState({
    collegeName: '',
    officialDomain: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profileData) {
      setFormData({
        collegeName: profileData.collegeName || '',
        officialDomain: profileData.officialDomain || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        pincode: profileData.pincode || '',
        phone: profileData.phone || ''
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = AuthManager.getToken();
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/college/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const errorText = await response.text().catch(() => 'Failed to update profile');
        setError(errorText || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Network error: ${err.message}. Please check if backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Edit College Profile</h3>
            <p className="text-sm text-slate-500 mt-1">Update your institution details</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">College Name</label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter college name"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Official Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="officialDomain"
                  value={formData.officialDomain}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="example.edu"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Street address"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="City"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="State"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Pincode"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Phone number"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main College Dashboard
const CollegeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statistics, setStatistics] = useState({
    totalProjects: 0,
    pendingApprovals: 0,
    approvedStudents: 0,
    approvedFaculty: 0
  });
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentFaculties, setRecentFaculties] = useState([]);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Token setup
  useEffect(() => {
    // Get token from localStorage or prompt user to enter it for testing
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      AuthManager.setToken(storedToken);
    } else {
      // For testing: You need to replace this with your actual JWT token
      console.warn('No auth token found in localStorage. Please login or set a token.');
    }
  }, []);

  const handleLogout = () => {
    AuthManager.clearToken();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = AuthManager.getToken();
      
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch profile
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/college/profile`, {
          method: 'GET',
          headers: headers
        });
        
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setProfileData(profile);
        } else if (profileResponse.status === 404) {
          console.log('No college profile found - user needs to register');
          setProfileData(null);
        } else if (profileResponse.status === 401) {
          setError('Authentication failed. Please login again.');
          return;
        } else {
          console.warn('Profile fetch failed with status:', profileResponse.status);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }

      // Fetch statistics with better error handling
      try {
        const statsResponse = await fetch(`${API_BASE_URL}/college/statistics`, {
          method: 'GET',
          headers: headers
        });
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          // Ensure all expected fields exist
          setStatistics({
            totalProjects: stats.totalProjects || 0,
            pendingApprovals: stats.pendingApprovals || 0,
            approvedStudents: stats.approvedStudents || 0,
            approvedFaculty: stats.approvedFaculty || 0
          });
        } else {
          console.warn('Statistics endpoint returned non-OK status:', statsResponse.status);
          // Keep default statistics
        }
      } catch (err) {
        console.error('Statistics fetch error:', err);
        // Keep default statistics
      }

      // Fetch all students
      try {
        const studentsResponse = await fetch(`${API_BASE_URL}/college/students`, {
          method: 'GET',
          headers: headers
        });
        
        if (studentsResponse.ok) {
          const studentData = await studentsResponse.json();
          setStudents(Array.isArray(studentData) ? studentData : []);
        } else {
          console.warn('Students endpoint returned status:', studentsResponse.status);
        }
      } catch (err) {
        console.error('Students fetch error:', err);
        setStudents([]);
      }

      // Fetch recent students
      try {
        const recentStudentsResponse = await fetch(`${API_BASE_URL}/college/students/recent`, {
          method: 'GET',
          headers: headers
        });
        
        if (recentStudentsResponse.ok) {
          const recentStudentData = await recentStudentsResponse.json();
          setRecentStudents(Array.isArray(recentStudentData) ? recentStudentData : []);
        }
      } catch (err) {
        console.error('Recent students fetch error:', err);
        setRecentStudents([]);
      }

      // Fetch all faculties
      try {
        const facultiesResponse = await fetch(`${API_BASE_URL}/college/faculty`, {
          method: 'GET',
          headers: headers
        });
        
        if (facultiesResponse.ok) {
          const facultyData = await facultiesResponse.json();
          setFaculties(Array.isArray(facultyData) ? facultyData : []);
        }
      } catch (err) {
        console.error('Faculties fetch error:', err);
        setFaculties([]);
      }

      // Fetch recent faculties
      try {
        const recentFacultiesResponse = await fetch(`${API_BASE_URL}/college/faculty/recent`, {
          method: 'GET',
          headers: headers
        });
        
        if (recentFacultiesResponse.ok) {
          const recentFacultyData = await recentFacultiesResponse.json();
          setRecentFaculties(Array.isArray(recentFacultyData) ? recentFacultyData : []);
        }
      } catch (err) {
        console.error('Recent faculties fetch error:', err);
        setRecentFaculties([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to connect to backend at ${API_BASE_URL}. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaculties = faculties.filter(faculty =>
    faculty.facultyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ icon: Icon, count, label, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{count || 0}</div>
      <div className="text-sm font-semibold text-slate-900 mb-1">{label}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );

  const StudentCard = ({ student }) => (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-blue-200">
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
          {student.studentName?.substring(0, 2).toUpperCase() || 'ST'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate mb-1">{student.studentName || 'Unknown Student'}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Mail className="w-3.5 h-3.5" />
            <p className="truncate">{student.user?.email || student.email || 'No email'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
              {student.rollNo || 'No Roll Number'}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-medium">
              {student.branch || 'General'}
            </span>
            {student.semester && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md font-medium">
                Sem {student.semester}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const FacultyCard = ({ faculty }) => (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-purple-200">
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
          {faculty.facultyName?.substring(0, 2).toUpperCase() || 'FC'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate mb-1">{faculty.facultyName || 'Unknown Faculty'}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Mail className="w-3.5 h-3.5" />
            <p className="truncate">{faculty.user?.email || faculty.email || 'No email'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md font-medium">
              {faculty.department || 'General'}
            </span>
            {faculty.facultyId && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                ID: {faculty.facultyId}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-2 shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900">College Portal</h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 mb-2">YOUR COLLEGE</div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
            <div className="font-semibold text-slate-900 text-sm">{profileData?.collegeName || 'Not Registered'}</div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {profileData?.officialDomain || 'No domain set'}
            </div>
            {profileData?.status && (
              <div className="mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  profileData.status === 'APPROVED' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {profileData.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {[
          { id: 'overview', icon: Building2, label: 'Overview' },
          { id: 'students', icon: GraduationCap, label: 'Students', count: students.length },
          { id: 'faculty', icon: UserCheck, label: 'Faculty', count: faculties.length },
          { id: 'profile', icon: Edit, label: 'Profile' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            {item.count !== undefined && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === item.id ? 'bg-white bg-opacity-20' : 'bg-slate-200 text-slate-700'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg mb-3 border border-slate-200">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm">
            {profileData?.collegeName?.substring(0, 2).toUpperCase() || 'CA'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-900 truncate">{profileData?.collegeName || 'Admin'}</div>
            <div className="text-xs text-slate-500 truncate">{profileData?.email || 'Not logged in'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg border border-red-200">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Connection Error</h2>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchDashboardData}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="w-full px-4 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-40 shadow-sm">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600 hover:text-slate-900">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="lg:ml-64 p-6 lg:p-8 pt-20 lg:pt-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">College Overview</h1>
              <p className="text-slate-600">Welcome back! Here's what's happening with your institution</p>
            </div>

            {!profileData && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">College Not Registered</h3>
                    <p className="text-sm text-amber-800 mb-4">You need to register your college before accessing the full dashboard.</p>
                    <button
                      onClick={() => setShowCollegeModal(true)}
                      className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      Register College Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={GraduationCap} 
                count={students.length} 
                label="Total Students" 
                subtitle="Registered students"
                color="bg-gradient-to-br from-blue-600 to-blue-700"
              />
              <StatCard 
                icon={UserCheck} 
                count={faculties.length} 
                label="Total Faculty" 
                subtitle="Teaching staff"
                color="bg-gradient-to-br from-purple-600 to-purple-700"
              />
              <StatCard 
                icon={Award} 
                count={statistics?.totalProjects || 0} 
                label="Projects" 
                subtitle="Active projects"
                color="bg-gradient-to-br from-emerald-600 to-emerald-700"
              />
              <StatCard 
                icon={Clock} 
                count={statistics?.pendingApprovals || 0} 
                label="Pending" 
                subtitle="Awaiting approval"
                color="bg-gradient-to-br from-amber-600 to-amber-700"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Recent Students</h2>
                    <p className="text-sm text-slate-500 mt-1">Latest registrations</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentStudents.slice(0, 5).map(student => (
                    <StudentCard key={student.studentId || Math.random()} student={student} />
                  ))}
                  {recentStudents.length === 0 && (
                    <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                      <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No students registered yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Recent Faculty</h2>
                    <p className="text-sm text-slate-500 mt-1">Latest additions</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('faculty')}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentFaculties.slice(0, 5).map(faculty => (
                    <FacultyCard key={faculty.facultyId || Math.random()} faculty={faculty} />
                  ))}
                  {recentFaculties.length === 0 && (
                    <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                      <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No faculty registered yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profileData && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">College Information</h2>
                    <p className="text-sm text-slate-500 mt-1">Your institution details</p>
                  </div>
                  {profileData.status === 'APPROVED' && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-600">College Name</span>
                    </div>
                    <p className="text-slate-900 font-medium">{profileData.collegeName}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-600">Domain</span>
                    </div>
                    <p className="text-slate-900 font-medium">{profileData.officialDomain || 'Not set'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-slate-600">Status</span>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      profileData.status === 'APPROVED' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {profileData.status}
                    </span>
                  </div>
                  {profileData.address && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-semibold text-slate-600">Address</span>
                      </div>
                      <p className="text-slate-900 font-medium">{profileData.address}</p>
                    </div>
                  )}
                  {profileData.city && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-semibold text-slate-600">City, State</span>
                      </div>
                      <p className="text-slate-900 font-medium">{profileData.city}, {profileData.state}</p>
                    </div>
                  )}
                  {profileData.phone && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-600">Phone</span>
                      </div>
                      <p className="text-slate-900 font-medium">{profileData.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">All Students</h2>
                <p className="text-sm text-slate-500 mt-1">{students.length} total students registered</p>
              </div>
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, roll no, branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <StudentCard key={student.studentId || Math.random()} student={student} />
              ))}
              {filteredStudents.length === 0 && (
                <div className="col-span-3 bg-white rounded-lg p-12 text-center border border-slate-200">
                  <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-1">No students found</p>
                  <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faculty' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">All Faculty</h2>
                <p className="text-sm text-slate-500 mt-1">{faculties.length} total faculty members</p>
              </div>
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFaculties.map(faculty => (
                <FacultyCard key={faculty.facultyId || Math.random()} faculty={faculty} />
              ))}
              {filteredFaculties.length === 0 && (
                <div className="col-span-3 bg-white rounded-lg p-12 text-center border border-slate-200">
                  <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-1">No faculty found</p>
                  <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">College Profile</h2>
              <p className="text-sm text-slate-500 mt-1">Manage your institution information</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 max-w-4xl">
              {profileData ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between pb-6 border-b border-slate-200">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{profileData.collegeName}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          profileData.status === 'APPROVED' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {profileData.status}
                        </span>
                        {profileData.status === 'PENDING' && (
                          <span className="text-xs text-amber-600">Awaiting admin approval</span>
                        )}
                      </div>
                    </div>
                    {profileData.status === 'APPROVED' && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Official Domain</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                        <Globe className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-900">{profileData.officialDomain || 'Not set'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-900 truncate">{profileData.email || 'Not set'}</span>
                      </div>
                    </div>
                    {profileData.phone && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Phone className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-900">{profileData.phone}</span>
                        </div>
                      </div>
                    )}
                    {profileData.pincode && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-900">{profileData.pincode}</span>
                        </div>
                      </div>
                    )}
                    {profileData.address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                        <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                          <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                          <span className="text-slate-900">{profileData.address}</span>
                        </div>
                      </div>
                    )}
                    {(profileData.city || profileData.state) && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-900">{profileData.city}, {profileData.state}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {profileData.status === 'PENDING' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-1">Pending Approval</h4>
                          <p className="text-sm text-amber-800">Your college registration is awaiting admin approval. You'll be able to edit your profile once approved.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No College Registered</h3>
                  <p className="text-slate-500 mb-6">Register your college to get started with the platform</p>
                  <button
                    onClick={() => setShowCollegeModal(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Building2 className="w-5 h-5" />
                    Register College
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <CollegeRegistrationModal 
        isOpen={showCollegeModal}
        onClose={() => setShowCollegeModal(false)}
        onSuccess={fetchDashboardData}
      />

      <EditProfileModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchDashboardData}
        profileData={profileData}
      />
    </div>
  );
};

export default CollegeDashboard;
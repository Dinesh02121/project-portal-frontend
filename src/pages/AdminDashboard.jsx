import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Building2, LogOut, Search, Filter, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [colleges, setColleges] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [authChecked, setAuthChecked] = useState(false);

  const API_BASE = `${process.env.REACT_APP_API_URL}/auth/admin`;
  
  // Show notification helper
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check authentication on mount
  useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    showNotification('No authentication token found. Please login first.', 'error');
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 2000);
  } else {
    setAuthChecked(true);
  }
}, []);


  // Logout function
  const handleLogout = () => {
  localStorage.removeItem('authToken'); 
  localStorage.removeItem('userRole');
  localStorage.removeItem('user'); 
  window.location.href = '/auth/login'; 
};

  const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  console.log('Fetch Request:', url);
  console.log('Token available:', !!token);
  
  if (!token) {
    const error = new Error('No authentication token found. Please login.');
    console.error(error.message);
    showNotification(error.message, 'error');
    setTimeout(() => handleLogout(), 1500);
    throw error;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });


    if (response.status === 401 || response.status === 403) {
      showNotification('Session expired or unauthorized. Please login again.', 'error');
      setTimeout(() => handleLogout(), 1500);
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Request failed'}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('Server returned non-JSON response.');
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    throw error;
  }
};


  // Fetch all students
  const fetchAllStudents = async () => {
    if (!authChecked) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await fetchWithAuth(`${API_BASE}/student`);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification(error.message || 'Error fetching students', 'error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all faculty
  const fetchAllFaculty = async () => {
    if (!authChecked) {
      return;
    }
    
    setLoading(true);
    try {

      const data = await fetchWithAuth(`${API_BASE}/faculty`);
      setFaculty(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification(error.message || 'Error fetching faculty', 'error');
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students by college
  const fetchStudentsByCollege = async (collegeName) => {
    if (!authChecked) return;
    
    setLoading(true);
    try {
      const data = await fetchWithAuth(`${API_BASE}/studentData/${encodeURIComponent(collegeName)}`);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
  
      showNotification(error.message || 'Error fetching college students', 'error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch faculty by college
  const fetchFacultyByCollege = async (collegeName) => {
    if (!authChecked) return;
    
    setLoading(true);
    try {
    
      const data = await fetchWithAuth(`${API_BASE}/facultyData/${encodeURIComponent(collegeName)}`);
      setFaculty(Array.isArray(data) ? data : []);
    
    } catch (error) {
      showNotification(error.message || 'Error fetching college faculty', 'error');
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all colleges
  const fetchAllColleges = async () => {
    if (!authChecked) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await fetchWithAuth(`${API_BASE}/colleges`);
      setColleges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch colleges error:', error);
      showNotification(error.message || 'Error fetching colleges', 'error');
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  // Approve/Reject college
const updateCollegeStatus = async (collegeName, status) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      showNotification('No authentication token found. Please login.', 'error');
      setTimeout(() => handleLogout(), 1500);
      return;
    }

  
    const response = await fetch(`${API_BASE}/approve/${encodeURIComponent(collegeName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: `"${status}"`,
    });

    if (response.status === 401 || response.status === 403) {
      showNotification('Session expired. Please login again.', 'error');
      setTimeout(() => handleLogout(), 1500);
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update college status');
    }

    const message = await response.text();
    showNotification(message || 'College status updated successfully', 'success');
    await fetchAllColleges();
  } catch (error) {
    showNotification(error.message || 'Error updating college status', 'error');
  } finally {
    setLoading(false);
  }
};
  const handleCollegeSelect = (college) => {
    setSelectedCollege(college);
    setActiveView('overview');
    if (college) {
      fetchStudentsByCollege(college.collegeName);
      fetchFacultyByCollege(college.collegeName);
    } else {
      fetchAllStudents();
      fetchAllFaculty();
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchAllColleges();
    if (selectedCollege) {
      fetchStudentsByCollege(selectedCollege.collegeName);
      fetchFacultyByCollege(selectedCollege.collegeName);
    } else {
      fetchAllStudents();
      fetchAllFaculty();
    }
  };

  useEffect(() => {
    if (authChecked) {
      const loadInitialData = async () => {
        await fetchAllColleges();
        await fetchAllStudents();
        await fetchAllFaculty();
      };
      
      loadInitialData();
    }
  }, [authChecked]);

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter colleges based on search and status
  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.collegeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.officialDomain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || college.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ icon: Icon, count, label, subtitle, bgColor, trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`${bgColor} bg-opacity-10 p-4 rounded-xl`}>
          <Icon className={`w-7 h-7 ${bgColor.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            +{trend}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
      <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200'
    };

    const icons = {
      APPROVED: CheckCircle,
      PENDING: Clock,
      REJECTED: XCircle
    };

    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${styles[status] || styles.PENDING}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  // Show loading screen during auth check
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">Verifying authentication...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border-2 ${
          notification.type === 'success' 
            ? 'bg-white border-emerald-500 text-emerald-700' 
            : 'bg-white border-rose-500 text-rose-700'
        } animate-in slide-in-from-top-5 duration-300`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-md">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">College Portal</h1>
                <p className="text-sm text-blue-100">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* College Selection */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Selected View</div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className={`${selectedCollege ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-gray-600 to-gray-700'} p-2.5 rounded-lg text-white font-bold text-sm shadow-md`}>
                  {selectedCollege ? getInitials(selectedCollege.collegeName) : 'ALL'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">
                    {selectedCollege ? selectedCollege.collegeName : 'All Colleges'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedCollege ? selectedCollege.officialDomain : 'System-wide view'}
                  </div>
                </div>
              </div>
              {selectedCollege ? (
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedCollege.status} />
                  <button
                    onClick={() => handleCollegeSelect(null)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs px-3 py-2 rounded-lg font-semibold text-center border border-blue-200">
                  Viewing All Data
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${
                  activeView === 'overview'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveView('students')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-all ${
                  activeView === 'students'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5" />
                  <span>Students</span>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => setActiveView('faculty')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-all ${
                  activeView === 'faculty'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <span>Faculty</span>
                </div>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {faculty.length}
                </span>
              </button>

              <button
                onClick={() => setActiveView('colleges')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-all ${
                  activeView === 'colleges'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" />
                  <span>All Colleges</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {colleges.length}
                </span>
              </button>
            </nav>
          </div>

          {/* User & Logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-3 p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm w-11 h-11 rounded-full flex items-center justify-center shadow-md">
                AD
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">System Administrator</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-semibold border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  {activeView === 'overview' && 'College Overview'}
                  {activeView === 'students' && 'Students Management'}
                  {activeView === 'faculty' && 'Faculty Management'}
                  {activeView === 'colleges' && 'Colleges Management'}
                </h2>
                <p className="text-sm text-gray-600">
                  {activeView === 'overview' && "Welcome back! Here's what's happening with your institutions"}
                  {activeView === 'students' && 'Manage and view all registered students'}
                  {activeView === 'faculty' && 'Manage and view all teaching staff'}
                  {activeView === 'colleges' && 'Manage college approvals and status'}
                </p>
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-gray-600 font-medium">Loading data...</p>
                </div>
              </div>
            )}

            {!loading && activeView === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <StatCard
                    icon={GraduationCap}
                    count={students.length}
                    label="Total Students"
                    subtitle="Registered students"
                    bgColor="bg-blue-600"
                    trend={12}
                  />
                  <StatCard
                    icon={Users}
                    count={faculty.length}
                    label="Total Faculty"
                    subtitle="Teaching staff"
                    bgColor="bg-purple-600"
                    trend={8}
                  />
                  <StatCard
                    icon={Building2}
                    count={colleges.filter(c => c.status === 'APPROVED').length}
                    label="Approved Colleges"
                    subtitle="Active institutions"
                    bgColor="bg-emerald-600"
                    trend={5}
                  />
                  <StatCard
                    icon={Clock}
                    count={colleges.filter(c => c.status === 'PENDING').length}
                    label="Pending Approvals"
                    subtitle="Awaiting review"
                    bgColor="bg-amber-600"
                  />
                </div>

                {/* Recent Data Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Recent Students */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Recent Students</h3>
                          <p className="text-sm text-gray-600">Latest registrations</p>
                        </div>
                        <button
                          onClick={() => setActiveView('students')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                          View All →
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      {students.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No students registered yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {students.slice(0, 3).map((student, index) => (
                            <div key={student.studentId || index} className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                {getInitials(student.studentName)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 text-base">{student.studentName}</div>
                                <div className="text-sm text-gray-600 mt-0.5">{student.user?.email || student.email || 'N/A'}</div>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  {student.rollNo && (
                                    <span className="bg-white text-gray-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-gray-300">
                                      {student.rollNo}
                                    </span>
                                  )}
                                  {student.branch && (
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-emerald-200">
                                      {student.branch}
                                    </span>
                                  )}
                                  {student.semester && (
                                    <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-purple-200">
                                      Sem {student.semester}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Faculty */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Recent Faculty</h3>
                          <p className="text-sm text-gray-600">Latest additions</p>
                        </div>
                        <button
                          onClick={() => setActiveView('faculty')}
                          className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                        >
                          View All →
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      {faculty.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No faculty registered yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {faculty.slice(0, 3).map((fac, index) => (
                            <div key={fac.facultyId || index} className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold text-sm w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                {getInitials(fac.facultyName)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 text-base">{fac.facultyName}</div>
                                <div className="text-sm text-gray-600 mt-0.5">{fac.user?.email || fac.email || 'N/A'}</div>
                                <div className="flex gap-2 mt-3">
                                  {fac.department && (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-blue-200">
                                      {fac.department}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && activeView === 'students' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {students.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">No students found</p>
                    <p className="text-gray-400 text-sm mt-2">Students will appear here once they register</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Roll No</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Branch</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Semester</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">College</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student, index) => (
                          <tr key={student.studentId || index} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xs w-11 h-11 rounded-xl flex items-center justify-center shadow-md">
                                  {getInitials(student.studentName)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{student.studentName}</div>
                                  <div className="text-sm text-gray-500">{student.user?.email || student.email || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-700">{student.rollNo || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              {student.branch ? (
                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-emerald-200">
                                  {student.branch}
                                </span>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              {student.semester ? (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-purple-200">
                                  Sem {student.semester}
                                </span>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">{student.college?.collegeName || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!loading && activeView === 'faculty' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {faculty.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">No faculty found</p>
                    <p className="text-gray-400 text-sm mt-2">Faculty members will appear here once they register</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Faculty</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">College</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {faculty.map((fac, index) => (
                          <tr key={fac.facultyId || index} className="hover:bg-purple-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold text-xs w-11 h-11 rounded-xl flex items-center justify-center shadow-md">
                                  {getInitials(fac.facultyName)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{fac.facultyName}</div>
                                  <div className="text-sm text-gray-500">{fac.user?.email || fac.email || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {fac.department ? (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-blue-200">
                                  {fac.department}
                                </span>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">{fac.college?.collegeName || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!loading && activeView === 'colleges' && (
              <div>
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search colleges by name or domain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Filter className="w-5 h-5 text-gray-500" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold bg-white"
                      >
                        <option value="ALL">All Status</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Colleges Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {filteredColleges.length === 0 ? (
                    <div className="text-center py-24">
                      <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">No colleges found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {searchTerm || statusFilter !== 'ALL' 
                          ? 'Try adjusting your search or filters' 
                          : 'Colleges will appear here once they register'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-emerald-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">College</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredColleges.map((college, index) => (
                            <tr key={college.collegeId || index} className="hover:bg-emerald-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xs w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                                    {getInitials(college.collegeName)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{college.collegeName}</div>
                                    <div className="text-sm text-gray-500">{college.officialDomain || 'N/A'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                {college.city && college.state ? `${college.city}, ${college.state}` : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={college.status} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  {college.status !== 'APPROVED' && (
                                    <button
                                      onClick={() => updateCollegeStatus(college.collegeName, 'APPROVED')}
                                      className="px-4 py-2 bg-emerald-600 text-white text-xs rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
                                      disabled={loading}
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {college.status !== 'REJECTED' && (
                                    <button
                                      onClick={() => updateCollegeStatus(college.collegeName, 'REJECTED')}
                                      className="px-4 py-2 bg-rose-600 text-white text-xs rounded-xl hover:bg-rose-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
                                      disabled={loading}
                                    >
                                      Reject
                                    </button>
                                  )}
                                  {college.status !== 'PENDING' && (
                                    <button
                                      onClick={() => updateCollegeStatus(college.collegeName, 'PENDING')}
                                      className="px-4 py-2 bg-amber-600 text-white text-xs rounded-xl hover:bg-amber-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
                                      disabled={loading}
                                    >
                                      Pending
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCollegeSelect(college)}
                                    className="px-4 py-2 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

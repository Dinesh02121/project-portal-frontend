
import React, { useState, useEffect } from 'react';
import { GraduationCap, FolderOpen, Clock, CheckCircle, Users, Plus, Search, TrendingUp, Star, Menu, X, LogOut, Upload, FileText, AlertCircle, ChevronRight, Folder, File, Code, Image as ImageIcon, Download, ArrowLeft, Brain, Sparkles, Lock, Trash2 } from 'lucide-react';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// File Viewer Component
const FileViewer = ({ projectId, onBack }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    fetchFiles(currentPath);
    setSelectedFile(null);
    setFileContent('');
  }, [currentPath, projectId]);

  const fetchFiles = async (path) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      const url = `${API_BASE_URL}/auth/student/dashboard/project/${projectId}/files${path ? `?path=${encodeURIComponent(path)}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        setError('');
      } else {
        const errorText = await response.text();
        setError('Failed to load files: ' + errorText);
      }
    } catch (err) {
      setError('Error loading files: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filePath) => {
    try {
      setLoadingContent(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_BASE_URL}/auth/student/dashboard/project/${projectId}/file/content?path=${encodeURIComponent(filePath)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const content = await response.text();
        setFileContent(content);
      } else {
        const errorText = await response.text();
        setFileContent('Error loading file content: ' + errorText);
      }
    } catch (err) {
      setFileContent('Error loading file content: ' + err.message);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }
    
    const isDir = selectedFile.isDirectory === true || selectedFile.directory === true;
    
    if (isDir) {
      setError('Cannot download folders. Please click on a file instead.');
      setSelectedFile(null);
      return;
    }
    
    try {
      setDownloading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_BASE_URL}/auth/student/dashboard/project/${projectId}/file/download?path=${encodeURIComponent(selectedFile.path)}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = selectedFile.name;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (err) {
      const errorMessage = err.message.replace('Error: ', '');
      setError(`Failed to download: ${errorMessage}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleFileClick = (file) => {
    const isDir = Boolean(file.isDirectory || file.directory);
    
    if (isDir) {
      setCurrentPath(file.path);
      setSelectedFile(null);
      setFileContent('');
      setError('');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    
    if (isTextFile(file.name)) {
      fetchFileContent(file.path);
    } else {
      setFileContent('');
    }
  };

  const handleBack = () => {
    if (selectedFile) {
      setSelectedFile(null);
      setFileContent('');
    } else if (currentPath) {
      const lastSlashIndex = currentPath.lastIndexOf('/');
      const parentPath = lastSlashIndex > 0 ? currentPath.substring(0, lastSlashIndex) : '';
      setCurrentPath(parentPath);
    } else {
      onBack();
    }
  };

  const getFileIcon = (fileName, isDirectory) => {
    const isDir = isDirectory === true || isDirectory?.directory === true;
    
    if (isDir) return <Folder className="w-5 h-5 text-blue-500" />;
    
    const ext = fileName.split('.').pop().toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx', 'java', 'py', 'cpp', 'c', 'html', 'css', 'go', 'rs', 'php'].includes(ext)) {
      return <Code className="w-5 h-5 text-green-500" />;
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const isTextFile = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const textExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'java', 'py', 'cpp', 'c', 'h', 'hpp', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'r',
      'html', 'htm', 'css', 'scss', 'sass', 'less', 'vue',
      'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
      'md', 'markdown', 'txt', 'rst', 'adoc', 'tex', 'latex', 'bib',
      'sh', 'bash', 'zsh', 'bat', 'ps1', 'cmd',
      'sql', 'graphql', 'prisma',
      'gradle', 'maven', 'dockerfile', 'makefile',
      'log', 'csv', 'tsv', 'properties', 'env', 'gitignore', 'gitattributes', 'editorconfig',
      'jsp', 'jspx', 'tag', 'tld'
    ];
    return textExtensions.includes(ext);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <div className="text-sm text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded">
          /{currentPath || 'root'}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Files & Folders
          </h3>
          <div className="space-y-2">
            {files.map((file, idx) => {
              const isDir = file.isDirectory === true || file.directory === true;
              return (
                <button
                  key={idx}
                  onClick={() => handleFileClick(file)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left ${
                    selectedFile?.path === file.path && !isDir ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                  }`}
                >
                  {getFileIcon(file.name, isDir)}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{file.name}</div>
                    {!isDir && <div className="text-xs text-slate-500">{file.size}</div>}
                  </div>
                  {isDir && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
              );
            })}
            {files.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Folder className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No files found</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          {selectedFile && !selectedFile.isDirectory ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.name, false)}
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedFile.name}</h3>
                    <p className="text-xs text-slate-500">{selectedFile.size}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </button>
              </div>
              <div className="max-h-[500px] overflow-auto">
                {loadingContent ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : isTextFile(selectedFile.name) ? (
                  <pre className="text-sm bg-slate-50 p-4 rounded-lg overflow-x-auto font-mono">
                    <code>{fileContent}</code>
                  </pre>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <File className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">Preview not available</p>
                    <p className="text-sm mt-2">This file type cannot be previewed in the browser</p>
                    <button
                      onClick={handleDownload}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download to view
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-slate-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-lg">Select a file to preview</p>
                <p className="text-sm mt-2">Click on any file from the left panel</p>
                <p className="text-xs mt-4 text-slate-400">Folders will open automatically when clicked</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Project Modal
const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collegeId: '',
    facultyId: ''
  });
  const [zipFile, setZipFile] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchColleges();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.collegeId) {
      fetchFaculties(formData.collegeId);
    } else {
      setFaculties([]);
      setFormData(prev => ({ ...prev, facultyId: '' }));
    }
  }, [formData.collegeId]);

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/colleges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  const fetchFaculties = async (collegeId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/colleges/${collegeId}/faculties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (err) {
      console.error('Error fetching faculties:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        setError('Only ZIP files are allowed');
        setZipFile(null);
        e.target.value = '';
        return;
      }
      setZipFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }
    if (!formData.collegeId) {
      setError('Please select a college');
      return;
    }
    if (!formData.facultyId) {
      setError('Please select a faculty');
      return;
    }
    if (!zipFile) {
      setError('Please upload a project ZIP file');
      return;
    }

    const fileSizeMB = zipFile.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      setError('File size exceeds 100MB. Please compress your project or remove unnecessary files.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const formDataToSend = new FormData();
      
      const jsonData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        collegeId: parseInt(formData.collegeId),
        facultyId: parseInt(formData.facultyId)
      };
      
      formDataToSend.append('data', new Blob([JSON.stringify(jsonData)], {
        type: 'application/json'
      }));
      formDataToSend.append('file', zipFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const response = await fetch(`${API_BASE_URL}/auth/student/dashboard/create/project`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const message = await response.text();
        setSuccess(message || 'Project created successfully!');
        setFormData({ title: '', description: '', collegeId: '', facultyId: '' });
        setZipFile(null);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to create project');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Upload timeout. The file may be too large or server is not responding.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Connection lost. Check your file size (must be under 100MB).');
      } else {
        setError('Network error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Create New Project</h3>
            <p className="text-sm text-slate-500 mt-1">Submit your academic project for review</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Project Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter project title"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Project Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Describe your project..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">College *</label>
              <select
                name="collegeId"
                value={formData.collegeId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              >
                <option value="">Select College</option>
                {colleges.map(college => (
                  <option key={college.collegeId} value={college.collegeId}>
                    {college.collegeName || 'Unknown College'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Assign Faculty *</label>
              <select
                name="facultyId"
                value={formData.facultyId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading || !formData.collegeId}
              >
                <option value="">Select Faculty</option>
                {faculties.map(faculty => (
                  <option key={faculty.facultyId} value={faculty.facultyId}>
                    {faculty.facultyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Project ZIP File *</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
                id="zip-upload"
                disabled={loading}
              />
              <label htmlFor="zip-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                Choose ZIP file
              </label>
              <p className="text-xs text-slate-500 mt-2">
                {zipFile ? zipFile.name : 'Only .zip files are allowed'}
              </p>
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Project Recommendation Component
const AIProjectRecommendation = ({ studentId, onClose }) => {
 const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    skills: [],
    interest_area: '',
    level: 'intermediate'
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [previousProjects, setPreviousProjects] = useState([]);
  const [attemptCount, setAttemptCount] = useState(0);

  const interestAreas = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'IoT', 'Game Development'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner', desc: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
    { value: 'advanced', label: 'Advanced', desc: 'Highly skilled' }
  ];

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleGenerate = async () => {
    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }
    if (!formData.interest_area) {
      setError('Please select an interest area');
      return;
    }

    setLoading(true);
    setError('');
    setStep('generating');

    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/recommend-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          skills: formData.skills,
          interest_area: formData.interest_area,
          level: formData.level
        })
      });

      if (!response.ok) throw new Error('Failed to generate recommendation');

      const data = await response.json();

      if (data.locked) {
        setPreviousProjects(data.projects || []);
        setStep('locked');
      } else {
        setRecommendation(data.project);
        setAttemptCount(data.attempt);
        setStep('result');
      }
    } catch (err) {
      setError('Failed to generate AI recommendation. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setStep('form');
    setRecommendation(null);
    setError('');
  };

  if (step === 'generating') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="relative mb-6">
            <Brain className="w-16 h-16 text-purple-600 mx-auto animate-bounce" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">AI is Thinking...</h3>
          <p className="text-slate-600 mb-4">Analyzing your skills and generating a personalized project</p>
        </div>
      </div>
    );
  }

  if (step === 'locked') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8" />
                <div>
                  <h3 className="text-2xl font-bold">Maximum Recommendations Reached</h3>
                  <p className="text-red-100 text-sm mt-1">You've used all 5 AI-generated project recommendations</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white hover:text-red-100">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <h4 className="font-bold text-lg text-slate-900 mb-4">Your Previous Recommendations</h4>
            <div className="space-y-4">
              {previousProjects.map((project, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h5 className="font-bold text-slate-900 mb-2">{project.title}</h5>
                  <p className="text-sm text-slate-600">{project.problem_statement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && recommendation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h3 className="text-2xl font-bold">AI-Generated Project</h3>
                  <p className="text-purple-100 text-sm mt-1">Attempt {attemptCount} of 5</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white hover:text-purple-100">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">{recommendation.title}</h4>
              <p className="text-slate-700">{recommendation.problem_statement}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {attemptCount < 5 && (
                <button onClick={handleTryAgain} className="flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold">
                  Generate Another ({5 - attemptCount} left)
                </button>
              )}
              <button onClick={onClose} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">AI Project Generator</h3>
                <p className="text-purple-100 text-sm mt-1">Get personalized project recommendations powered by AI</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-purple-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Your Skills *</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="e.g., React, Python, Node.js"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg outline-none"
              />
              <button onClick={handleAddSkill} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2 text-sm">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Interest Area *</label>
            <select
              value={formData.interest_area}
              onChange={(e) => setFormData(prev => ({ ...prev, interest_area: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none"
            >
              <option value="">Select an interest area</option>
              {interestAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Experience Level *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {levels.map(level => (
                <button
                  key={level.value}
                  onClick={() => setFormData(prev => ({ ...prev, level: level.value }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.level === level.value ? 'border-purple-600 bg-purple-50' : 'border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-900 mb-1">{level.label}</div>
                  <div className="text-xs text-slate-500">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate AI Project
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard
const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [viewingProjectId, setViewingProjectId] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState({
    active: 0,
    review: 0,
    completed: 0,
    collaboration: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAuthToken = () => localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  const handleDeleteProject = async (projectId) => {
  if (!projectId) {
    alert('Invalid project ID');
    return;
  }
  
  if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    return;
  }
  
  try {
    setDeletingProject(projectId);
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/auth/student/dashboard/delete-project/${projectId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'  // Add this
      }
    });
    
    // Read the response body BEFORE checking status
    const responseText = await response.text();
    
    if (response.ok) {
      alert(responseText || 'Project deleted successfully');
      fetchDashboardData();
      if (activeTab === 'projects') fetchAllProjects();
    } else {
      // Show the actual error from backend
      console.error('Delete failed:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText
      });
      alert(`Failed to delete project:\n\nStatus: ${response.status}\nError: ${responseText}`);
    }
  } catch (err) {
    console.error('Network error:', err);
    alert('Network error while deleting project: ' + err.message);
  } finally {
    setDeletingProject(null);
  }
};
  const handleDeleteProfile = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete your account and ALL your projects. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }
    
    if (!window.confirm('Final confirmation: Delete your account permanently?')) {
      return;
    }
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/auth/student/dashboard/delete-student`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const message = await response.text();
        alert(message || 'Account deleted successfully');
        handleLogout();
      } else {
        const error = await response.text();
        alert('Failed to delete account: ' + error);
      }
    } catch (err) {
      alert('Error deleting account: ' + err.message);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const profileResponse = await fetch(`${API_BASE_URL}/auth/student/dashboard/profile`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setStudentData({
          studentId: profile.studentId,
          name: profile.studentName || 'Student',
          email: profile.email || '',
          college: profile.collegeName || 'College',
          initials: getInitials(profile.studentName || 'Student')
        });
      }

      const summaryResponse = await fetch(`${API_BASE_URL}/auth/student/dashboard/summary`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        setDashboardSummary(summary);
      }

      const projectsResponse = await fetch(`${API_BASE_URL}/auth/student/dashboard/recent-projects`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (projectsResponse.ok) {
        const projects = await projectsResponse.json();
        setRecentProjects(projects);
      }

      if (activeTab === 'projects') {
        await fetchAllProjects();
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.message?.includes('401')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE_URL}/auth/student/dashboard/projects`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (response.ok) {
        const projects = await response.json();
        setAllProjects(projects);
      }
    } catch (error) {
      console.error('Error fetching all projects:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'APPROVED': 'bg-emerald-100 text-emerald-700',
      'PENDING': 'bg-amber-100 text-amber-700',
      'UNDER_REVIEW': 'bg-blue-100 text-blue-700',
      'FACULTY_REQUESTED': 'bg-purple-100 text-purple-700',
      'REJECTED': 'bg-red-100 text-red-700',
      'IN_PROGRESS': 'bg-cyan-100 text-cyan-700'
    };
    return statusMap[status] || 'bg-slate-100 text-slate-700';
  };

  const StatCard = ({ icon: Icon, count, label, subtitle, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{count}</div>
      <div className="text-sm font-semibold text-slate-900 mb-1">{label}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-slate-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-slate-900 text-white w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0">
            {project.title?.substring(0, 2).toUpperCase() || 'PR'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">{project.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
          </div>
        </div>
        <button 
          onClick={() => setViewingProjectId(project.projectId)}
          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
        >
          <FileText className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status?.replace('_', ' ')}
        </span>
        <span className="text-sm text-slate-500">{formatDate(project.submittedAt)}</span>
        {project.facultyName && (
          <span className="text-sm text-slate-500">Faculty: {project.facultyName}</span>
        )}
      </div>

      {project.progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {project.teamProject ? '👥 Team Project' : '👤 Solo Project'}
        </span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleDeleteProject(project.projectId)}
            disabled={deletingProject === project.projectId}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
          >
            {deletingProject === project.projectId ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </>
            )}
          </button>
          <button 
            onClick={() => setViewingProjectId(project.projectId)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Code →
          </button>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, label, subtitle, color, textColor, onClick }) => (
    <button 
      onClick={onClick}
      className={`${color} ${textColor || 'text-white'} rounded-xl p-5 text-left hover:scale-105 transition-transform shadow-sm w-full`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5" />
        <div>
          <div className="font-semibold mb-1">{label}</div>
          <div className="text-xs opacity-80">{subtitle}</div>
        </div>
      </div>
    </button>
  );

  const quickActions = [
    { 
      icon: Plus, 
      label: 'Create New Project', 
      subtitle: 'Start your next idea', 
      color: 'bg-slate-900',
      action: () => setShowCreateProject(true)
    },
    { 
      icon: Brain, 
      label: 'AI Project Ideas', 
      subtitle: 'Get AI recommendations', 
      color: 'bg-gradient-to-r from-purple-600 to-blue-600',
      textColor: 'text-white',
      action: () => setShowAIRecommendation(true)
    },
    { 
      icon: FolderOpen, 
      label: 'View All Projects', 
      subtitle: 'Browse your work', 
      color: 'bg-emerald-50', 
      textColor: 'text-emerald-700',
      action: () => {
        setActiveTab('projects');
        fetchAllProjects();
      }
    },
    { 
      icon: Search, 
      label: 'Find Collaborators', 
      subtitle: 'Connect with peers', 
      color: 'bg-purple-50', 
      textColor: 'text-purple-700',
      action: () => alert('Coming soon!')
    },
    { 
      icon: TrendingUp, 
      label: 'View Progress', 
      subtitle: 'Track your work', 
      color: 'bg-amber-50', 
      textColor: 'text-amber-700',
      action: () => {
        setActiveTab('projects');
        fetchAllProjects();
      }
    }
  ];
  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 rounded-xl p-2">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900">Project Portal</h1>
            <p className="text-xs text-slate-500">Academic Platform</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 mb-2">YOUR ROLE</div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="font-semibold text-slate-900">Student</div>
            <div className="text-xs text-slate-600 mt-1">{studentData?.college || 'Loading...'}</div>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {[
          { id: 'dashboard', icon: FolderOpen, label: 'Dashboard' },
          { id: 'projects', icon: FolderOpen, label: 'My Projects' },
          { id: 'discover', icon: Search, label: 'Discover Projects' },
          { id: 'starred', icon: Star, label: 'Starred Projects' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === 'projects') fetchAllProjects();
              if (item.id === 'dashboard') fetchDashboardData();
              setSidebarOpen(false);
              setViewingProjectId(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-2">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
            {studentData?.initials || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-900 truncate">{studentData?.name || 'Loading...'}</div>
            <div className="text-xs text-slate-500 truncate">{studentData?.email || ''}</div>
          </div>
        </div>
        <button
          onClick={handleDeleteProfile}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-2"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Delete Account</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="lg:ml-64 p-6 lg:p-8 pt-20 lg:pt-8">
        {viewingProjectId ? (
          <FileViewer 
            projectId={viewingProjectId} 
            onBack={() => setViewingProjectId(null)} 
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard 
                    icon={FolderOpen} 
                    count={dashboardSummary.active} 
                    label="Active Projects" 
                    subtitle="Projects in development"
                    color="bg-slate-900"
                  />
                  <StatCard 
                    icon={Clock} 
                    count={dashboardSummary.review} 
                    label="Under Review" 
                    subtitle="Awaiting faculty feedback"
                    color="bg-amber-500"
                  />
                  <StatCard 
                    icon={CheckCircle} 
                    count={dashboardSummary.completed} 
                    label="Completed" 
                    subtitle="Successfully approved"
                    color="bg-emerald-500"
                  />
                  <StatCard 
                    icon={Users} 
                    count={dashboardSummary.collaboration} 
                    label="Collaborations" 
                    subtitle="Team partnerships"
                    color="bg-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Recent Projects</h2>
                        <p className="text-sm text-slate-500 mt-1">Your latest academic work</p>
                      </div>
                      <button 
                        onClick={() => setShowCreateProject(true)}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        New Project
                      </button>
                    </div>

                    <div className="space-y-4">
                      {recentProjects.length > 0 ? (
                        recentProjects.map(project => (
                          <ProjectCard key={project.projectId} project={project} />
                        ))
                      ) : (
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
                          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
                          <p className="text-sm text-slate-500 mb-4">Create your first project to get started</p>
                          <button 
                            onClick={() => setShowCreateProject(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Create Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
                      <p className="text-sm text-slate-500 mt-1">Common tasks and shortcuts</p>
                    </div>

                    <div className="space-y-3">
                      {quickActions.map((action, idx) => (
                        <QuickActionCard key={idx} {...action} onClick={action.action} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">All My Projects</h2>
                    <p className="text-sm text-slate-500 mt-1">{allProjects.length} total projects</p>
                  </div>
                  <button 
                    onClick={() => setShowCreateProject(true)}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New Project
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allProjects.length > 0 ? (
                    allProjects.map(project => (
                      <ProjectCard key={project.projectId} project={project} />
                    ))
                  ) : (
                    <div className="col-span-2 bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
                      <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects found</h3>
                      <p className="text-sm text-slate-500">Start by creating your first project</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'discover' && (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Discover Projects</h2>
                <p className="text-slate-500">Coming soon...</p>
              </div>
            )}

            {activeTab === 'starred' && (
              <div className="text-center py-20">
                <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Starred Projects</h2>
                <p className="text-slate-500">Coming soon...</p>
              </div>
            )}
          </>
        )}
      </div>

      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <CreateProjectModal 
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSuccess={fetchDashboardData}
      />
      {showAIRecommendation && studentData && (
        <AIProjectRecommendation 
          studentId={studentData.studentId || 1}
          onClose={() => setShowAIRecommendation(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
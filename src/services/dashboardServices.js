// src/services/dashboardService.js

import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class DashboardService {
  // Get auth headers
  getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get dashboard summary
  async getSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/student/dashboard/summary`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  }

  // Get recent projects
  async getRecentProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/student/dashboard/recent-projects`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent projects');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      throw error;
    }
  }

  // Get all my projects
  async getAllMyProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/student/dashboard/projects`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Create new project
  async createProject(projectData, file) {
    try {
      const formData = new FormData();
      
      // Add project data as JSON
      formData.append('data', new Blob([JSON.stringify(projectData)], {
        type: 'application/json'
      }));
      
      // Add file
      formData.append('file', file);

      const token = authService.getToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE_URL}/student/dashboard/project`, {
        method: 'POST',
        headers: headers,
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      return await response.text();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
}

export default new DashboardService();
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class AuthService {
  // Login function
  async login(email, password, isAdmin = false) {
    try {
      const endpoint = isAdmin ? '/auth/loginAdmin' : '/auth/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store token and user info
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.role) {
        localStorage.setItem('userRole', data.role);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Logout function
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Get user role
  getRole() {
    return localStorage.getItem('userRole');
  }
}

export default new AuthService();
import { api, setToken } from './api.js';

export const authService = {
  /**
   * Register a new student account
   */
  async register({ name, email, password }) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response?.data?.token) {
      setToken(response.data.token);
      localStorage.setItem('campuspulse_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  /**
   * Log in user
   */
  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    if (response?.data?.token) {
      setToken(response.data.token);
      localStorage.setItem('campuspulse_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    return await api.get('/auth/me');
  },

  /**
   * Log out user and clear stored auth credentials
   */
  logout() {
    setToken(null);
    localStorage.removeItem('campuspulse_user');
  },
};

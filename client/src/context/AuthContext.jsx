import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { getToken } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Initialize and restore auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        if (response?.success && response?.data?.user) {
          setUser(response.data.user);
          setTokenState(storedToken);
        } else {
          authService.logout();
          setUser(null);
          setTokenState(null);
        }
      } catch (error) {
        console.error('🔓 [Auth Restoration Error]:', error.message);
        authService.logout();
        setUser(null);
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response?.success && response?.data) {
      setUser(response.data.user);
      setTokenState(response.data.token);
    }
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authService.register({ name, email, password });
    if (response?.success && response?.data) {
      setUser(response.data.user);
      setTokenState(response.data.token);
    }
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setTokenState(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

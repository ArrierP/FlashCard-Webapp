import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios globally
axios.defaults.withCredentials = true;
// Default to API URL or fallback to localhost:3000 in dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // App initialization: check current login status
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // User not logged in or cookie expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng thử lại.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (email, username, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/register', { email, username, password });
      // Optionally login automatically after register
      await login(email, password);
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

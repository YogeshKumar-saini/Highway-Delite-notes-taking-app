import { useState, useEffect } from 'react';
import API from './api';

const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.defaults.headers['Authorization'] = `Bearer ${token}`;
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    API.defaults.headers['Authorization'] = `Bearer ${token}`;
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete API.defaults.headers['Authorization'];
    setAuthenticated(false);
  };

  return { authenticated, loading, login, logout };
};

export default useAuth;

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

const ADMIN_STORAGE_KEY = 'whoami_admin_auth_key';

export function AdminAuthProvider({ children }) {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedKey) {
        setAdminKey(storedKey);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.warn('Failed to read admin key from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (key) => {
    if (!key || !key.trim()) {
      return { success: false, error: 'Please enter a valid admin key.' };
    }
    const cleanKey = key.trim();
    setAdminKey(cleanKey);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, cleanKey);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return { success: true };
  };

  const logout = () => {
    setAdminKey('');
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminKey,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

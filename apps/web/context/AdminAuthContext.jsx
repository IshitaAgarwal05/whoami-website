'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

const ADMIN_STORAGE_KEY = 'whoami_admin_auth_session';

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on mount from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isAuthenticated && parsed.username === 'admin') {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.warn('Failed to restore admin auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log in using administrative credentials
   * Requires username: "admin" and password: "admin"
   */
  const login = (username, password) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    if (cleanUser === 'admin' && cleanPass === 'admin') {
      const sessionData = {
        username: 'admin',
        role: 'Super Administrator',
        isAuthenticated: true,
        loggedInAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sessionData));
      } catch (e) {
        console.warn('Could not save admin session to localStorage:', e);
      }
      setUser(sessionData);
      setIsAuthenticated(true);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please enter username: "admin" and password: "admin".'
    };
  };

  /**
   * Log out and clear session
   */
  const logout = () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage error on logout:', e);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout
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

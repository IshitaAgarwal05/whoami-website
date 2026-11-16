'use client';

import React, { useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { useAdminAuth } from '../../context/AdminAuthContext';
import '../../components/Admin/Admin.css';

export default function AdminLayout({ children }) {
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const res = login(keyInput);
    if (!res.success) {
      setAuthError(res.error || 'Authentication failed');
    }
  };

  if (isLoading) {
    return (
      <div className="admin-auth-screen">
        <div style={{ color: 'var(--admin-gold)', fontWeight: 600, fontSize: '0.9rem' }}>
          Loading Admin Studio...
        </div>
      </div>
    );
  }

  // If not authenticated, show modern key entry gate
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-screen">
        <div className="admin-auth-card">
          <div className="auth-header">
            <img src="/whoami_logo.png" alt="WhoAmI Logo" />
            <h2>WhoAmI Admin Studio</h2>
            <p>Enter your admin authorization key to access design tokens, CSS generator, and controls.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="auth-form">
            {authError && <div className="auth-error">{authError}</div>}

            <div className="auth-input-group">
              <label htmlFor="adminKey">Admin Passkey / API Key</label>
              <input
                id="adminKey"
                type="password"
                className="auth-input"
                placeholder="Enter admin secret key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                autoFocus
              />
            </div>

            <button type="submit" className="btn-admin btn-admin-primary" style={{ padding: '0.75rem', width: '100%' }}>
              Authorize & Enter
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => login('whoami-admin-dev')}
                className="btn-admin btn-admin-outline"
                style={{ fontSize: '0.75rem', border: 'none', color: 'var(--admin-text-muted)' }}
              >
                Quick Developer Access
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

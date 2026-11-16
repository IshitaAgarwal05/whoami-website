'use client';

import React from 'react';
import Link from 'next/link';
import AdminHeader from '../../components/Admin/AdminHeader';
import { useTheme } from '../../context/ThemeContext';
import { THEME_PRESETS } from '../../utils/defaultTheme';

export default function AdminDashboardPage() {
  const { activePreset, isLiveMode, toggleLiveMode, downloadCssFile } = useTheme();
  const currentPresetName = THEME_PRESETS[activePreset]?.name || 'Custom Theme';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AdminHeader title="Overview" />

      <div className="admin-dashboard-container">
        {/* Hero Banner */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-text">
            <h1>WhoAmI Admin Studio</h1>
            <p>
              Manage global brand styling, configure CSS tokens in real-time, test live on the storefront,
              and export production-ready stylesheets.
            </p>
          </div>
          <Link href="/admin-dashboard/css-generator" className="btn-admin btn-admin-primary" style={{ padding: '0.8rem 1.4rem' }}>
            Open CSS Generator →
          </Link>
        </div>

        {/* Action Grid */}
        <div className="dashboard-grid">
          {/* Card 1: CSS Generator */}
          <div className="dashboard-card">
            <div>
              <div className="card-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <h3>CSS Generator & Studio</h3>
              <p>
                Visually configure color tokens, typography scales, border radii, shadows, and spacing.
                Features an instant split-screen reactive preview.
              </p>
            </div>
            <Link href="/admin-dashboard/css-generator" className="btn-admin btn-admin-primary">
              Launch Studio
            </Link>
          </div>

          {/* Card 2: Live Mode */}
          <div className="dashboard-card">
            <div>
              <div className="card-icon-box" style={{ color: isLiveMode ? '#10b981' : '#94a3b8', background: isLiveMode ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
              </div>
              <h3>Live Site Theming</h3>
              <p>
                Dynamically injects active theme tokens into the root document, letting you test your generated
                styles across every real page of the store.
              </p>
            </div>
            <button
              onClick={toggleLiveMode}
              className={`btn-admin ${isLiveMode ? 'btn-admin-secondary' : 'btn-admin-primary'}`}
            >
              {isLiveMode ? 'Disable Live Mode' : 'Enable Live Mode'}
            </button>
          </div>

          {/* Card 3: Download CSS */}
          <div className="dashboard-card">
            <div>
              <div className="card-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3>Download Stylesheet</h3>
              <p>
                Export your current active tokens into a clean, commented <code>theme.css</code> ready for production deployment or archival.
              </p>
            </div>
            <button onClick={() => downloadCssFile('whoami-theme.css')} className="btn-admin btn-admin-secondary">
              Download .css
            </button>
          </div>

          {/* Card 4: Storefront & Blog */}
          <div className="dashboard-card">
            <div>
              <div className="card-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h3>Content & Blog Manager</h3>
              <p>
                Publish and manage community stories, craftsmanship articles, and fandom guides directly to the live blog.
              </p>
            </div>
            <Link href="/blog" className="btn-admin btn-admin-secondary">
              Manage Articles
            </Link>
          </div>
        </div>

        {/* System & Design System Status */}
        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--admin-text-main)', marginBottom: '1rem' }}>
            Design System Integration Status
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--admin-sidebar-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Active Preset</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-gold)' }}>{currentPresetName}</div>
            </div>
            <div style={{ background: 'var(--admin-sidebar-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Total Token Attributes</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>40+ CSS Variables</div>
            </div>
            <div style={{ background: 'var(--admin-sidebar-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Connected Stylesheets</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>30 CSS Files</div>
            </div>
            <div style={{ background: 'var(--admin-sidebar-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Next.js App Router</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>v16.2.4 (Active)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

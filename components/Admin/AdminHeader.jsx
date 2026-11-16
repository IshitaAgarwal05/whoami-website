'use client';

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { copyToClipboard } from '../../utils/cssGenerator';

export default function AdminHeader({ title = 'Dashboard', onOpenCodeModal }) {
  const { isLiveMode, toggleLiveMode, downloadCssFile, cssString } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(cssString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <div className="admin-breadcrumb">
          <span>Admin</span>
          <span>/</span>
          <span className="admin-breadcrumb-active">{title}</span>
        </div>
      </div>

      <div className="admin-topbar-actions">
        {/* Test on Live Site Mode Toggle */}
        <div
          className={`live-mode-badge ${isLiveMode ? 'active' : ''}`}
          onClick={toggleLiveMode}
          title="When enabled, injected CSS tokens apply live across the actual storefront pages"
        >
          <span className="live-indicator"></span>
          <span>Live Site Mode: {isLiveMode ? 'ON' : 'OFF'}</span>
        </div>

        {/* Copy CSS */}
        <button
          onClick={handleCopy}
          className="btn-admin btn-admin-secondary"
          title="Copy compiled CSS to clipboard"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>{copied ? 'Copied!' : 'Copy CSS'}</span>
        </button>

        {/* View CSS Code */}
        {onOpenCodeModal && (
          <button
            onClick={onOpenCodeModal}
            className="btn-admin btn-admin-secondary"
            title="Inspect compiled CSS stylesheet"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>View Code</span>
          </button>
        )}

        {/* Download CSS File */}
        <button
          onClick={() => downloadCssFile('whoami-theme.css')}
          className="btn-admin btn-admin-primary"
          title="Download production-ready theme.css file"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download .CSS</span>
        </button>
      </div>
    </header>
  );
}

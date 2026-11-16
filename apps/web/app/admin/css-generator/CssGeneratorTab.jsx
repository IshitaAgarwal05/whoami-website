'use client';

import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import ThemeEditor from './ThemeEditor';
import ThemePreview from './ThemePreview';
import CssCodeModal from '../../../components/Admin/CssCodeModal';
import { copyToClipboard } from '../../../utils/cssGenerator';

export default function CssGeneratorTab() {
  const { isLiveMode, toggleLiveMode, downloadCssFile, cssString } = useTheme();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
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
    <div className="css-generator-tab-wrapper">
      {/* Top Action Bar */}
      <div className="generator-topbar">
        <div>
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            <span>CSS Generator & Theme Studio</span>
            <span className="section-tag">Design System</span>
          </h2>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Customize storefront tokens, preview changes live, and compile production-ready CSS stylesheets.
          </p>
        </div>

        <div className="admin-actions">
          {/* Live Site Toggle */}
          <button
            className={`btn-toggle-switch ${isLiveMode ? 'is-active-btn' : ''}`}
            onClick={toggleLiveMode}
            title="When active, dynamic token overrides apply across the actual website pages"
          >
            <span>{isLiveMode ? '● Live Store Mode: ON' : '○ Live Store Mode: OFF'}</span>
          </button>

          {/* Copy CSS */}
          <button
            onClick={handleCopy}
            className="btn-secondary-action"
            title="Copy compiled CSS to clipboard"
          >
            <span>{copied ? '✓ Copied!' : '📋 Copy CSS'}</span>
          </button>

          {/* View Code */}
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="btn-secondary-action"
            title="Inspect compiled CSS code"
          >
            <span>👁️ View Code</span>
          </button>

          {/* Download */}
          <button
            onClick={() => downloadCssFile('whoami-theme.css')}
            className="btn-primary-action"
            title="Download production CSS file"
          >
            <span>⬇ Download .CSS</span>
          </button>
        </div>
      </div>

      {/* Studio Workspace */}
      <div className="theme-studio" style={{ height: '780px', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden', marginTop: '16px' }}>
        <ThemeEditor />
        <ThemePreview />
      </div>

      {/* Code Modal */}
      <CssCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}

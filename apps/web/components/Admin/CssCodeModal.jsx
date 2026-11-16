'use client';

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { copyToClipboard } from '../../utils/cssGenerator';

export default function CssCodeModal({ isOpen, onClose }) {
  const { cssString, downloadCssFile } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await copyToClipboard(cssString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="code-modal-backdrop" onClick={onClose}>
      <div className="code-modal" onClick={(e) => e.stopPropagation()}>
        <div className="code-modal-header">
          <div>
            <h3>Compiled CSS Stylesheet</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
              Clean, valid CSS variables mapped to WhoAmI design tokens
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-admin btn-admin-outline"
            style={{ padding: '0.4rem 0.65rem' }}
          >
            ✕
          </button>
        </div>

        <div className="code-modal-body">
          <pre className="code-block-viewer">{cssString}</pre>
        </div>

        <div className="code-modal-footer">
          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            Ready for production use in <code>styles/index.css</code> or as a separate stylesheet.
          </span>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={handleCopy} className="btn-admin btn-admin-secondary">
              {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={() => downloadCssFile('whoami-theme.css')}
              className="btn-admin btn-admin-primary"
            >
              Download .css
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

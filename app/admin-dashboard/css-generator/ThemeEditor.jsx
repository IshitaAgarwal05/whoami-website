'use client';

import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { THEME_PRESETS, TOKEN_GROUPS } from '../../../utils/defaultTheme';
import ColorPickerInput from '../../../components/Admin/ColorPickerInput';
import RangeInput from '../../../components/Admin/RangeInput';

export default function ThemeEditor() {
  const {
    theme,
    customCss,
    activePreset,
    isDirty,
    updateVariable,
    applyPreset,
    resetDefaults,
    setCustomCss,
  } = useTheme();

  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: '🎨 Colors' },
    { id: 'typography', label: '🔤 Typography' },
    { id: 'shapes', label: '📐 Radii & Spacing' },
    { id: 'shadows', label: '💡 Shadows' },
    { id: 'custom', label: '💻 Custom CSS' },
  ];

  // Filter token groups based on active tab
  const visibleGroups = TOKEN_GROUPS.filter((group) => {
    if (activeTab === 'colors') return group.category === 'colors';
    if (activeTab === 'typography') return group.category === 'typography';
    if (activeTab === 'shapes') return group.category === 'radii' || group.category === 'spacing';
    if (activeTab === 'shadows') return group.category === 'shadows';
    return false;
  });

  return (
    <div className="studio-inspector">
      {/* Top Preset Bar */}
      <div className="inspector-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
            Design Tokens Inspector
          </span>
          {isDirty && (
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-gold)', background: 'rgba(255,184,77,0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              Customized
            </span>
          )}
        </div>

        <div className="preset-bar">
          <select
            className="preset-select"
            value={activePreset}
            onChange={(e) => applyPreset(e.target.value)}
          >
            {Object.values(THEME_PRESETS).map((p) => (
              <option key={p.id} value={p.id}>
                Theme: {p.name}
              </option>
            ))}
            {activePreset === 'custom' && (
              <option value="custom">Custom Theme</option>
            )}
          </select>

          <button
            onClick={resetDefaults}
            className="btn-admin btn-admin-outline"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
            title="Revert all variables to original index.css values"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inspector-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="inspector-content">
        {activeTab !== 'custom' ? (
          visibleGroups.map((group) => (
            <div key={group.id} className="token-group">
              <div className="token-group-title">{group.title}</div>
              <div className="token-group-desc">{group.description}</div>
              <div className="token-items">
                {group.tokens.map((token) => {
                  if (token.type === 'color') {
                    return (
                      <ColorPickerInput
                        key={token.key}
                        label={token.label}
                        tokenKey={token.key}
                        value={theme[token.key] || '#000000'}
                        onChange={updateVariable}
                      />
                    );
                  }

                  return (
                    <RangeInput
                      key={token.key}
                      label={token.label}
                      tokenKey={token.key}
                      value={theme[token.key] || ''}
                      onChange={updateVariable}
                      type={token.type}
                      options={token.options}
                      placeholder={token.placeholder}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="token-group">
            <div className="token-group-title">Custom CSS Declarations</div>
            <div className="token-group-desc">
              Write any standard CSS rules or overrides to be appended to your generated stylesheet.
            </div>
            <textarea
              className="custom-css-area"
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder={`/* Example custom rules: */\n.btn-primary {\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\n.product-card:hover {\n  transform: scale(1.02);\n}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

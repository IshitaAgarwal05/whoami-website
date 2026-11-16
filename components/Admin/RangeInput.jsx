'use client';

import React from 'react';

export default function RangeInput({ label, tokenKey, value, onChange, type = 'text', options = [], placeholder = '' }) {
  if (type === 'select') {
    return (
      <div className="text-control-row">
        <div className="token-label-box">
          <span className="token-label">{label}</span>
          <span className="token-key">{tokenKey}</span>
        </div>
        <select
          className="text-control-input"
          value={value || ''}
          onChange={(e) => onChange(tokenKey, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="text-control-row">
      <div className="token-label-box">
        <span className="token-label">{label}</span>
        <span className="token-key">{tokenKey}</span>
      </div>
      <input
        type="text"
        className="text-control-input"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(tokenKey, e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}

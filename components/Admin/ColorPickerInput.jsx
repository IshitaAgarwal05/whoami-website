'use client';

import React, { useState, useEffect } from 'react';

export default function ColorPickerInput({ label, tokenKey, value, onChange }) {
  const [localVal, setLocalVal] = useState(value || '#000000');

  useEffect(() => {
    setLocalVal(value || '#000000');
  }, [value]);

  const handleHexChange = (e) => {
    const newVal = e.target.value;
    setLocalVal(newVal);
    if (/^#[0-9A-Fa-f]{6}$/.test(newVal) || /^#[0-9A-Fa-f]{3}$/.test(newVal)) {
      onChange(tokenKey, newVal);
    }
  };

  const handlePickerChange = (e) => {
    const newVal = e.target.value.toUpperCase();
    setLocalVal(newVal);
    onChange(tokenKey, newVal);
  };

  // Convert for native input if needed
  const nativeValue = localVal.startsWith('#') && (localVal.length === 7 || localVal.length === 4)
    ? localVal
    : '#ffb84d';

  return (
    <div className="color-control-row">
      <div className="token-label-box">
        <span className="token-label">{label}</span>
        <span className="token-key">{tokenKey}</span>
      </div>
      <div className="color-input-container">
        <div
          className="color-preview-chip"
          style={{ backgroundColor: localVal }}
          title={`Click to pick color for ${label}`}
        >
          <input
            type="color"
            value={nativeValue}
            onChange={handlePickerChange}
          />
        </div>
        <input
          type="text"
          className="hex-text-input"
          value={localVal}
          onChange={handleHexChange}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

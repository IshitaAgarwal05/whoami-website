'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_THEME, THEME_PRESETS } from '../utils/defaultTheme';
import { generateCssString, downloadCssFile } from '../utils/cssGenerator';

const ThemeContext = createContext(null);

const STORAGE_KEY_THEME = 'whoami_custom_theme_tokens';
const STORAGE_KEY_CUSTOM_CSS = 'whoami_custom_css_rules';
const STORAGE_KEY_LIVE_MODE = 'whoami_theme_live_mode_active';
const STORAGE_KEY_PRESET = 'whoami_theme_active_preset';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [customCss, setCustomCss] = useState('');
  const [activePreset, setActivePreset] = useState('default');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      const savedCustomCss = localStorage.getItem(STORAGE_KEY_CUSTOM_CSS);
      const savedLiveMode = localStorage.getItem(STORAGE_KEY_LIVE_MODE);
      const savedPreset = localStorage.getItem(STORAGE_KEY_PRESET);

      if (savedTheme) {
        setTheme(JSON.parse(savedTheme));
      }
      if (savedCustomCss) {
        setCustomCss(savedCustomCss);
      }
      if (savedPreset) {
        setActivePreset(savedPreset);
      }
      if (savedLiveMode === 'true') {
        setIsLiveMode(true);
      }
    } catch (err) {
      console.warn('Failed to load saved theme tokens from localStorage:', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(theme));
      localStorage.setItem(STORAGE_KEY_CUSTOM_CSS, customCss);
      localStorage.setItem(STORAGE_KEY_PRESET, activePreset);
      localStorage.setItem(STORAGE_KEY_LIVE_MODE, String(isLiveMode));
    } catch (err) {
      console.error('Error saving theme state to localStorage:', err);
    }
  }, [theme, customCss, activePreset, isLiveMode, isInitialized]);

  // Inject or clear dynamic variables on root html document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    let customStyleEl = document.getElementById('whoami-custom-theme-overrides');

    if (isLiveMode) {
      // Inject all CSS variables directly to :root
      Object.entries(theme).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });

      // Inject custom CSS tag if present
      if (customCss && customCss.trim().length > 0) {
        if (!customStyleEl) {
          customStyleEl = document.createElement('style');
          customStyleEl.id = 'whoami-custom-theme-overrides';
          document.head.appendChild(customStyleEl);
        }
        customStyleEl.textContent = customCss;
      } else if (customStyleEl) {
        customStyleEl.remove();
      }
    } else {
      // Remove all injected inline properties so site reverts to original stylesheet
      Object.keys(DEFAULT_THEME).forEach((key) => {
        root.style.removeProperty(key);
      });
      if (customStyleEl) {
        customStyleEl.remove();
      }
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, [isLiveMode, theme, customCss]);

  // Update a single token
  const updateVariable = useCallback((key, value) => {
    setTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
    setActivePreset('custom');
  }, []);

  // Apply a preset
  const applyPreset = useCallback((presetId) => {
    const preset = THEME_PRESETS[presetId];
    if (preset) {
      setTheme({ ...preset.variables });
      setActivePreset(presetId);
    }
  }, []);

  // Reset to default design system values
  const resetDefaults = useCallback(() => {
    setTheme({ ...DEFAULT_THEME });
    setCustomCss('');
    setActivePreset('default');
  }, []);

  // Toggle Live Site Mode
  const toggleLiveMode = useCallback(() => {
    setIsLiveMode((prev) => !prev);
  }, []);

  // Generate CSS string
  const cssString = useMemo(() => {
    const presetObj = THEME_PRESETS[activePreset];
    const themeName = presetObj ? presetObj.name : 'Custom Generated Theme';
    return generateCssString(theme, customCss, { themeName });
  }, [theme, customCss, activePreset]);

  // Download CSS
  const handleDownload = useCallback((filename = 'whoami-theme.css') => {
    downloadCssFile(filename, cssString);
  }, [cssString]);

  // Check if anything is modified from defaults
  const isDirty = useMemo(() => {
    if (customCss.trim().length > 0) return true;
    for (const [key, val] of Object.entries(DEFAULT_THEME)) {
      if (theme[key] !== val) return true;
    }
    return false;
  }, [theme, customCss]);

  const value = {
    theme,
    customCss,
    activePreset,
    isLiveMode,
    isDirty,
    cssString,
    updateVariable,
    applyPreset,
    resetDefaults,
    setCustomCss,
    toggleLiveMode,
    downloadCssFile: handleDownload,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

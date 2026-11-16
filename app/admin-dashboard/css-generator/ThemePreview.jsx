'use client';

import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

export default function ThemePreview() {
  const { theme, customCss } = useTheme();
  const [viewport, setViewport] = useState('desktop');

  // Convert current theme tokens into inline CSS style properties for the mockup frame
  const frameStyles = {
    '--mock-bg': theme['--color-background'] || '#0F0F0F',
    '--mock-surface': theme['--color-surface'] || '#1A1A1A',
    '--mock-border': theme['--color-border'] || '#2B2B2B',
    '--mock-accent': theme['--color-accent'] || '#FFB84D',
    '--mock-warm-gold': theme['--color-warm-gold'] || '#FFB84D',
    '--mock-amber-glow': theme['--color-amber-glow'] || '#FF9500',
    '--mock-text-primary': theme['--color-text-primary'] || '#F5F5F3',
    '--mock-text-secondary': theme['--color-text-secondary'] || '#B8B8B8',
    '--mock-text-muted': theme['--color-text-muted'] || '#999999',
    '--mock-font': theme['--font-primary'] || 'inherit',
    '--mock-radius': theme['--radius-lg'] || '0.5rem',
    '--mock-radius-xl': theme['--radius-xl'] || '0.75rem',
    fontFamily: theme['--font-primary'] || 'inherit',
  };

  const sampleProducts = [
    {
      id: 1,
      title: 'Darth Vader Obsidian Bust',
      category: 'Star Wars Fandom',
      price: '₹1,499',
      badge: 'Bestseller',
      image: '/whoami_logo.png',
    },
    {
      id: 2,
      title: 'Cyberpunk Cyber-Blade Stand',
      category: 'Desk Artifacts',
      price: '₹1,899',
      badge: 'Limited',
      image: '/whoami_logo.png',
    },
    {
      id: 3,
      title: 'Arc Reactor Core Lamp',
      category: 'Marvel Universe',
      price: '₹2,299',
      badge: 'New',
      image: '/whoami_logo.png',
    },
  ];

  return (
    <div className="studio-preview">
      {/* Viewport switch toolbar */}
      <div className="preview-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
            Live Mockup Preview:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', background: 'rgba(255,184,77,0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
            Instant Reactive
          </span>
        </div>

        <div className="viewport-switchers">
          <button
            onClick={() => setViewport('desktop')}
            className={`viewport-btn ${viewport === 'desktop' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`viewport-btn ${viewport === 'tablet' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <span>Tablet (768px)</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`viewport-btn ${viewport === 'mobile' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <span>Mobile (390px)</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="preview-viewport-container">
        <div className={`preview-frame ${viewport}`} style={frameStyles}>
          {/* Mock Storefront Navbar */}
          <div className="mock-navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img src="/whoami_logo.png" alt="WhoAmI" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              <span className="mock-nav-brand">WhoAmI</span>
            </div>

            {viewport !== 'mobile' && (
              <div className="mock-nav-links">
                <span style={{ color: 'var(--mock-accent)' }}>Home</span>
                <span>Products</span>
                <span>Journal</span>
                <span>Our Story</span>
              </div>
            )}

            <div className="mock-cart-chip">
              Bag (2)
            </div>
          </div>

          {/* Mock Hero Section */}
          <div className="mock-hero">
            <span className="mock-hero-tag">Identity, Crafted. 🇮🇳</span>
            <h1 className="mock-hero-title">
              Artifacts for the quietly expressive.
            </h1>
            <p className="mock-hero-subtitle">
              Handcrafted 3D-printed desk accessories and collectibles. Not merchandise, your identity, made tangible.
            </p>
            <div className="mock-hero-actions">
              <button className="mock-btn-primary">
                Explore Collection
              </button>
              <button className="mock-btn-secondary">
                Our Philosophy
              </button>
            </div>
          </div>

          {/* Mock Product Catalog Section */}
          <div className="mock-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="mock-section-title" style={{ margin: 0 }}>Featured Artifacts</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--mock-accent)', cursor: 'pointer', fontWeight: 600 }}>
                View All →
              </span>
            </div>

            <div className="mock-product-grid">
              {sampleProducts.map((p) => (
                <div key={p.id} className="mock-card">
                  <div className="mock-card-img" style={{ position: 'relative' }}>
                    <img src={p.image} alt={p.title} style={{ width: '48px', height: '48px', opacity: 0.9 }} />
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--mock-accent)',
                        color: '#0F0F0F',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--mock-text-muted)', marginBottom: '0.2rem' }}>
                    {p.category}
                  </span>
                  <div className="mock-card-title">{p.title}</div>
                  <div className="mock-card-price">{p.price}</div>
                  <button
                    className="mock-btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.45rem',
                      fontSize: '0.75rem',
                      marginTop: 'auto',
                    }}
                  >
                    Add to Bag
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Palette Swatches */}
          <div className="swatches-strip">
            <div className="swatch-pill">
              <span className="swatch-circle" style={{ backgroundColor: theme['--color-background'] }}></span>
              <span>BG: {theme['--color-background']}</span>
            </div>
            <div className="swatch-pill">
              <span className="swatch-circle" style={{ backgroundColor: theme['--color-surface'] }}></span>
              <span>Surface: {theme['--color-surface']}</span>
            </div>
            <div className="swatch-pill">
              <span className="swatch-circle" style={{ backgroundColor: theme['--color-accent'] }}></span>
              <span>Accent: {theme['--color-accent']}</span>
            </div>
            <div className="swatch-pill">
              <span className="swatch-circle" style={{ backgroundColor: theme['--color-text-primary'] }}></span>
              <span>Text: {theme['--color-text-primary']}</span>
            </div>
            <div className="swatch-pill">
              <span className="swatch-circle" style={{ backgroundColor: theme['--color-border'] }}></span>
              <span>Border: {theme['--color-border']}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

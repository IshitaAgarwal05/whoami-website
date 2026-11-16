/**
 * WhoAmI Design System Default Tokens
 * Extracted from styles/index.css
 */

export const DEFAULT_THEME = {
  // Brand & Cosmic Blacks
  '--color-deep-black': '#0A0A0A',
  '--color-charcoal-black': '#1A1A1A',
  '--color-cosmic-dark': '#0F0F0F',
  '--color-background': '#0F0F0F',
  '--color-surface': '#1A1A1A',

  // Gold & Amber Accents
  '--color-warm-gold': '#FFB84D',
  '--color-amber-glow': '#FF9500',
  '--color-light-amber': '#FFC966',
  '--color-dark-gold': '#CC8A00',
  '--color-accent': '#FFB84D',

  // Contrast & Secondary Neutrals
  '--color-warm-white': '#FAF9F6',
  '--color-graphite-grey': '#2B2B2B',
  '--color-deep-blue-grey': '#1E2A33',
  '--color-deep-violet': '#4A148C',
  '--color-border': '#2B2B2B',

  // Text Hierarchy
  '--color-text-primary': '#F5F5F3',
  '--color-text-secondary': '#B8B8B8',
  '--color-text-muted': '#999999',

  // Typography
  '--font-primary': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  '--font-philosophical': "'Lora', Georgia, serif",

  // Font Sizes
  '--font-size-xs': '0.75rem',
  '--font-size-sm': '0.875rem',
  '--font-size-base': '1rem',
  '--font-size-lg': '1.125rem',
  '--font-size-xl': '1.25rem',
  '--font-size-2xl': '1.5rem',
  '--font-size-3xl': '1.875rem',
  '--font-size-4xl': '2.25rem',
  '--font-size-5xl': '3rem',
  '--font-size-6xl': '3.75rem',
  '--font-size-7xl': '4.5rem',

  // Font Weights
  '--font-weight-light': '300',
  '--font-weight-regular': '400',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--font-weight-bold': '700',
  '--font-weight-black': '900',

  // Spacing Scale
  '--spacing-xs': '0.25rem',
  '--spacing-sm': '0.5rem',
  '--spacing-md': '0.75rem',
  '--spacing-lg': '1rem',
  '--spacing-xl': '1.5rem',
  '--spacing-2xl': '2rem',
  '--spacing-3xl': '3rem',
  '--spacing-4xl': '4rem',
  '--spacing-5xl': '6rem',

  // Transitions
  '--transition-fast': '0.15s ease',
  '--transition-base': '0.2s ease',
  '--transition-slow': '0.3s ease',

  // Shadows
  '--shadow-sm': '0 1px 2px 0 rgba(15, 15, 15, 0.05)',
  '--shadow-base': '0 1px 3px 0 rgba(15, 15, 15, 0.1), 0 1px 2px 0 rgba(15, 15, 15, 0.06)',
  '--shadow-md': '0 4px 6px -1px rgba(15, 15, 15, 0.1), 0 2px 4px -1px rgba(15, 15, 15, 0.06)',
  '--shadow-lg': '0 10px 15px -3px rgba(15, 15, 15, 0.1), 0 4px 6px -2px rgba(15, 15, 15, 0.05)',
  '--shadow-xl': '0 20px 25px -5px rgba(15, 15, 15, 0.1), 0 10px 10px -5px rgba(15, 15, 15, 0.04)',

  // Border Radius
  '--radius-sm': '0.125rem',
  '--radius-base': '0.25rem',
  '--radius-md': '0.375rem',
  '--radius-lg': '0.5rem',
  '--radius-xl': '0.75rem',
  '--radius-2xl': '1rem',
  '--radius-full': '9999px',
};

export const THEME_PRESETS = {
  default: {
    id: 'default',
    name: 'Obsidian Gold (Default)',
    description: 'The signature WhoAmI luxury aesthetic with deep dark cosmic obsidian and radiant warm gold.',
    variables: { ...DEFAULT_THEME },
  },
  cosmicViolet: {
    id: 'cosmicViolet',
    name: 'Cosmic Violet & Neon',
    description: 'Deep mystical violet atmosphere with glowing magenta accents.',
    variables: {
      ...DEFAULT_THEME,
      '--color-background': '#0B0813',
      '--color-surface': '#161126',
      '--color-cosmic-dark': '#0B0813',
      '--color-deep-black': '#06040B',
      '--color-charcoal-black': '#161126',
      '--color-accent': '#C084FC',
      '--color-warm-gold': '#C084FC',
      '--color-amber-glow': '#A855F7',
      '--color-light-amber': '#E9D5FF',
      '--color-dark-gold': '#7E22CE',
      '--color-border': '#2E224D',
      '--color-text-primary': '#FAF5FF',
      '--color-text-secondary': '#C4B5FD',
      '--color-text-muted': '#8B7FB8',
    },
  },
  cyberpunkAmber: {
    id: 'cyberpunkAmber',
    name: 'Cyberpunk High-Volt',
    description: 'High-contrast dark terminal with fiery electric amber and neon cyan accents.',
    variables: {
      ...DEFAULT_THEME,
      '--color-background': '#05070A',
      '--color-surface': '#0E131A',
      '--color-accent': '#FF6B00',
      '--color-warm-gold': '#FF8A00',
      '--color-amber-glow': '#FF3D00',
      '--color-light-amber': '#FFA726',
      '--color-dark-gold': '#E65100',
      '--color-deep-blue-grey': '#00F0FF',
      '--color-border': '#1F2937',
      '--color-text-primary': '#FFFFFF',
      '--color-text-secondary': '#9CA3AF',
    },
  },
  emeraldNocturne: {
    id: 'emeraldNocturne',
    name: 'Emerald Nocturne',
    description: 'Rich dark jade and emerald tones with antique champagne gold highlights.',
    variables: {
      ...DEFAULT_THEME,
      '--color-background': '#07120F',
      '--color-surface': '#0D1E19',
      '--color-accent': '#10B981',
      '--color-warm-gold': '#34D399',
      '--color-amber-glow': '#059669',
      '--color-light-amber': '#6EE7B7',
      '--color-dark-gold': '#047857',
      '--color-border': '#1B352E',
      '--color-text-primary': '#ECFDF5',
      '--color-text-secondary': '#A7F3D0',
      '--color-text-muted': '#6EE7B7',
    },
  },
  minimalClean: {
    id: 'minimalClean',
    name: 'Atelier Minimal (Light)',
    description: 'Crisp editorial gallery aesthetic with warm parchment paper and deep ink text.',
    variables: {
      ...DEFAULT_THEME,
      '--color-background': '#F8F6F0',
      '--color-surface': '#FFFFFF',
      '--color-cosmic-dark': '#EFECE6',
      '--color-deep-black': '#E5E0D8',
      '--color-charcoal-black': '#FFFFFF',
      '--color-accent': '#C27803',
      '--color-warm-gold': '#D97706',
      '--color-amber-glow': '#B45309',
      '--color-light-amber': '#F59E0B',
      '--color-dark-gold': '#92400E',
      '--color-border': '#E2DDD5',
      '--color-text-primary': '#1A1816',
      '--color-text-secondary': '#57534E',
      '--color-text-muted': '#8C857B',
    },
  },
};

export const TOKEN_GROUPS = [
  {
    id: 'colors_base',
    title: 'Backgrounds & Surfaces',
    category: 'colors',
    description: 'Core container, page canvas, and card surface colors',
    tokens: [
      { key: '--color-background', label: 'Page Background', type: 'color' },
      { key: '--color-surface', label: 'Card Surface', type: 'color' },
      { key: '--color-cosmic-dark', label: 'Cosmic Dark', type: 'color' },
      { key: '--color-charcoal-black', label: 'Charcoal Black', type: 'color' },
      { key: '--color-deep-black', label: 'Deep Black', type: 'color' },
    ],
  },
  {
    id: 'colors_accent',
    title: 'Brand Accents & Gold Glow',
    category: 'colors',
    description: 'Signature brand accents, golden highlights, and button hues',
    tokens: [
      { key: '--color-accent', label: 'Primary Accent', type: 'color' },
      { key: '--color-warm-gold', label: 'Warm Gold', type: 'color' },
      { key: '--color-amber-glow', label: 'Amber Glow', type: 'color' },
      { key: '--color-light-amber', label: 'Light Amber', type: 'color' },
      { key: '--color-dark-gold', label: 'Dark Gold', type: 'color' },
      { key: '--color-deep-violet', label: 'Deep Violet', type: 'color' },
    ],
  },
  {
    id: 'colors_text',
    title: 'Text & Typography Colors',
    category: 'colors',
    description: 'Hierarchical readable text shades across dark and light components',
    tokens: [
      { key: '--color-text-primary', label: 'Primary Text', type: 'color' },
      { key: '--color-text-secondary', label: 'Secondary Text', type: 'color' },
      { key: '--color-text-muted', label: 'Muted Text', type: 'color' },
      { key: '--color-warm-white', label: 'Warm White', type: 'color' },
    ],
  },
  {
    id: 'colors_borders',
    title: 'Borders & Outlines',
    category: 'colors',
    description: 'Subtle separators, card outlines, and input borders',
    tokens: [
      { key: '--color-border', label: 'Border Color', type: 'color' },
      { key: '--color-graphite-grey', label: 'Graphite Grey', type: 'color' },
      { key: '--color-deep-blue-grey', label: 'Deep Blue-Grey', type: 'color' },
    ],
  },
  {
    id: 'typography',
    title: 'Typography & Fonts',
    category: 'typography',
    description: 'Font families, base heading sizes, and line scales',
    tokens: [
      {
        key: '--font-primary',
        label: 'Primary Font Family',
        type: 'select',
        options: [
          { label: 'Inter (Modern Sans)', value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
          { label: 'Lora (Editorial Serif)', value: "'Lora', Georgia, serif" },
          { label: 'Cinzel (Cinematic Serif)', value: "'Cinzel', Georgia, serif" },
          { label: 'Outfit (Geometric Sans)', value: "'Outfit', sans-serif" },
          { label: 'Playfair Display (Luxury Serif)', value: "'Playfair Display', serif" },
          { label: 'JetBrains Mono (Monospace)', value: "'JetBrains Mono', monospace" },
          { label: 'System Default', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
        ],
      },
      {
        key: '--font-philosophical',
        label: 'Philosophical / Accent Font',
        type: 'select',
        options: [
          { label: 'Lora (Editorial Serif)', value: "'Lora', Georgia, serif" },
          { label: 'Playfair Display (Luxury Serif)', value: "'Playfair Display', serif" },
          { label: 'Cinzel (Classical)', value: "'Cinzel', Georgia, serif" },
          { label: 'Inter (Clean Sans)', value: "'Inter', sans-serif" },
        ],
      },
      { key: '--font-size-base', label: 'Base Font Size', type: 'text', placeholder: '1rem' },
      { key: '--font-size-lg', label: 'Large Text (18px)', type: 'text', placeholder: '1.125rem' },
      { key: '--font-size-2xl', label: 'H4 Heading (24px)', type: 'text', placeholder: '1.5rem' },
      { key: '--font-size-4xl', label: 'H2 Heading (36px)', type: 'text', placeholder: '2.25rem' },
      { key: '--font-size-5xl', label: 'H1 Hero Title (48px)', type: 'text', placeholder: '3rem' },
    ],
  },
  {
    id: 'radii',
    title: 'Border Radii & Shapes',
    category: 'radii',
    description: 'Roundness applied to buttons, cards, pills, and dialogs',
    tokens: [
      { key: '--radius-sm', label: 'Small Radius (Tags/Chips)', type: 'text', placeholder: '0.125rem' },
      { key: '--radius-md', label: 'Medium Radius (Inputs)', type: 'text', placeholder: '0.375rem' },
      { key: '--radius-lg', label: 'Large Radius (Buttons)', type: 'text', placeholder: '0.5rem' },
      { key: '--radius-xl', label: 'Extra Large (Cards)', type: 'text', placeholder: '0.75rem' },
      { key: '--radius-2xl', label: 'Double XL (Modals)', type: 'text', placeholder: '1rem' },
      { key: '--radius-full', label: 'Full Round (Pills/Avatars)', type: 'text', placeholder: '9999px' },
    ],
  },
  {
    id: 'spacing',
    title: 'Spacing & Margins',
    category: 'spacing',
    description: 'Component padding, section gutters, and grid gaps',
    tokens: [
      { key: '--spacing-xs', label: 'Extra Small (4px)', type: 'text', placeholder: '0.25rem' },
      { key: '--spacing-sm', label: 'Small (8px)', type: 'text', placeholder: '0.5rem' },
      { key: '--spacing-md', label: 'Medium (12px)', type: 'text', placeholder: '0.75rem' },
      { key: '--spacing-lg', label: 'Large (16px)', type: 'text', placeholder: '1rem' },
      { key: '--spacing-xl', label: 'XL (24px)', type: 'text', placeholder: '1.5rem' },
      { key: '--spacing-2xl', label: '2XL (32px)', type: 'text', placeholder: '2rem' },
      { key: '--spacing-3xl', label: '3XL (48px)', type: 'text', placeholder: '3rem' },
    ],
  },
  {
    id: 'shadows',
    title: 'Elevation & Glow Shadows',
    category: 'shadows',
    description: 'Drop shadows and ambient glowing depth',
    tokens: [
      { key: '--shadow-sm', label: 'Subtle Shadow', type: 'text' },
      { key: '--shadow-md', label: 'Medium Elevation', type: 'text' },
      { key: '--shadow-lg', label: 'Card Hover Elevation', type: 'text' },
      { key: '--shadow-xl', label: 'Modal / Floating Shadow', type: 'text' },
    ],
  },
];

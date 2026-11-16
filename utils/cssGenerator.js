/**
 * CSS Generator Utility
 * Compiles theme variable tokens and custom CSS into production-ready stylesheets
 * and handles browser downloads.
 */

export function generateCssString(variables = {}, customCss = '', options = {}) {
  const {
    themeName = 'Custom Theme',
    includeTimestamp = true,
  } = options;

  const timestamp = includeTimestamp ? new Date().toISOString().replace('T', ' ').substring(0, 19) : '';

  // Group variables for clean organization
  const colorKeys = Object.keys(variables).filter(k => k.startsWith('--color-'));
  const fontKeys = Object.keys(variables).filter(k => k.startsWith('--font-'));
  const spacingKeys = Object.keys(variables).filter(k => k.startsWith('--spacing-'));
  const radiusKeys = Object.keys(variables).filter(k => k.startsWith('--radius-'));
  const shadowKeys = Object.keys(variables).filter(k => k.startsWith('--shadow-'));
  const transitionKeys = Object.keys(variables).filter(k => k.startsWith('--transition-'));
  const otherKeys = Object.keys(variables).filter(k => 
    !k.startsWith('--color-') &&
    !k.startsWith('--font-') &&
    !k.startsWith('--spacing-') &&
    !k.startsWith('--radius-') &&
    !k.startsWith('--shadow-') &&
    !k.startsWith('--transition-')
  );

  let output = `/* =========================================================================
 * WhoAmI Storefront Design System Stylesheet
 * Theme: ${themeName}
 * Generated: ${timestamp}
 * ========================================================================= */

:root {
  /* -----------------------------------------------------------------------
   * 1. Colors & Palette
   * ----------------------------------------------------------------------- */
`;

  colorKeys.forEach((key) => {
    output += `  ${key.padEnd(26)}: ${variables[key]};\n`;
  });

  if (fontKeys.length > 0) {
    output += `\n  /* -----------------------------------------------------------------------
   * 2. Typography & Font Scales
   * ----------------------------------------------------------------------- */\n`;
    fontKeys.forEach((key) => {
      output += `  ${key.padEnd(26)}: ${variables[key]};\n`;
    });
  }

  if (radiusKeys.length > 0) {
    output += `\n  /* -----------------------------------------------------------------------
   * 3. Border Radii
   * ----------------------------------------------------------------------- */\n`;
    radiusKeys.forEach((key) => {
      output += `  ${key.padEnd(26)}: ${variables[key]};\n`;
    });
  }

  if (spacingKeys.length > 0) {
    output += `\n  /* -----------------------------------------------------------------------
   * 4. Spacing Scale
   * ----------------------------------------------------------------------- */\n`;
    spacingKeys.forEach((key) => {
      output += `  ${key.padEnd(26)}: ${variables[key]};\n`;
    });
  }

  if (shadowKeys.length > 0) {
    output += `\n  /* -----------------------------------------------------------------------
   * 5. Shadows & Elevation
   * ----------------------------------------------------------------------- */\n`;
    shadowKeys.forEach((key) => {
      output += `  ${key.padEnd(26)}: ${variables[key]};\n`;
    });
  }

  if (transitionKeys.length > 0) {
    output += `\n  /* -----------------------------------------------------------------------
   * 6. Transitions
   * ----------------------------------------------------------------------- */\n`;
    transitionKeys.forEach((key) => {
      output += `  ${key.padEnd(26)}: ${variables[key]};\n`;
    });
  }

  if (otherKeys.length > 0) {
    output += `\n  /* -----------------------------------------------------------------------
   * 7. Other Design Variables
   * ----------------------------------------------------------------------- */\n`;
    otherKeys.forEach((key) => {
      output += `  ${key.padEnd(26)}: ${variables[key]};\n`;
    });
  }

  output += `}\n`;

  if (customCss && customCss.trim().length > 0) {
    output += `\n/* -----------------------------------------------------------------------
 * Custom CSS Overrides
 * ----------------------------------------------------------------------- */
${customCss.trim()}
`;
  }

  return output;
}

/**
 * Initiates an immediate client-side download of a .css file
 */
export function downloadCssFile(filename = 'whoami-theme.css', content = '') {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: 'text/css;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies string to clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const successful = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!successful) {
    throw new Error('Failed to copy to clipboard');
  }
}

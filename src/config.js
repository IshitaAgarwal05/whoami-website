// API Configuration
// In development: uses Vite proxy to localhost:5000
// In production: uses VITE_API_URL environment variable

const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    WHATSAPP_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || '',
    GOOGLE_SCRIPT_URL: import.meta.env.VITE_GOOGLE_SCRIPT_URL || '',
};

export default config;

// Helper to build API URLs and prevent double-slash issues
export const getApiUrl = (endpoint) => {
    const base = (config.API_BASE_URL || '').replace(/\/$/, ''); // Remove trailing slash from base
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`; // Ensure endpoint has leading slash
    return `${base}${path}`;
};

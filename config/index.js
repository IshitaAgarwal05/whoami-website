// API Configuration for Next.js
// In development: uses NEXT_PUBLIC_API_BASE_URL from .env
// In production: uses NEXT_PUBLIC_API_BASE_URL environment variable

const config = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000',
    WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    GOOGLE_SCRIPT_URL: process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '',
};

export default config;

// Helper to build API URLs and prevent double-slash issues
export const getApiUrl = (endpoint) => {
    const base = (config.API_BASE_URL || '').replace(/\/$/, ''); // Remove trailing slash from base
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`; // Ensure endpoint has leading slash
    return `${base}${path}`;
};

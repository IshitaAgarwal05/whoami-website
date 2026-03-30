// API Configuration
// In development: uses Vite proxy to localhost:5000
// In production: uses VITE_API_URL environment variable

const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    WHATSAPP_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'
};

export default config;

// Helper to build API URLs
export const getApiUrl = (endpoint) => {
    return `${config.API_BASE_URL}${endpoint}`;
};

require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const cachingService = require('./services/cachingService');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (needed for Render/load balancers)
app.set('trust proxy', 1);

// -------------------------------------------------------------------
// CORS — restrict to allowed origins
// -------------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Standardize: remove trailing slash for comparison
        const sanitizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === sanitizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`❌ CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// -------------------------------------------------------------------
// Rate Limiters — use Redis store if connected, fall back to in-memory
// -------------------------------------------------------------------
const buildLimiter = (windowMs, limit, message) => {
    const options = {
        windowMs,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { success: false, error: message }
    };
    if (cachingService.client && cachingService.connected) {
        options.store = new RedisStore({
            sendCommand: (...args) => cachingService.client.sendCommand(args),
        });
    }
    return rateLimit(options);
};

const limiter = buildLimiter(
    15 * 60 * 1000,
    100,
    'Too many requests, please try again later.'
);

const reloadLimiter = buildLimiter(
    60 * 60 * 1000,
    5,
    'Reload limit reached. Please wait an hour.'
);

// -------------------------------------------------------------------
// Middleware
// -------------------------------------------------------------------
app.use(express.json());
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// -------------------------------------------------------------------
// Routes
// -------------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the WhoAmI API. Everything is running smoothly!',
        docs: 'Connect your frontend to see the merchandise.'
    });
});

app.use('/api/products/reload', reloadLimiter);
app.use('/api/products', productRoutes);

// Health check — useful for verifying Redis status on Render
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        redis: cachingService.connected ? 'connected' : 'disabled',
        message: 'WhoAmI API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// -------------------------------------------------------------------
// Start server
// -------------------------------------------------------------------
app.listen(PORT, () => {
    const redisStatus = cachingService.connected ? 'active' : 'disabled (set REDIS_URL to enable)';
    console.log(`\n🚀 WhoAmI API running on http://localhost:${PORT}`);
    console.log(`⚡ Redis caching: ${redisStatus}`);
    console.log(`🔒 Rate limiting: ${cachingService.connected ? 'Redis-backed' : 'in-memory'}`);
    console.log(`🌐 CORS origins: ${allowedOrigins.join(', ')}\n`);
});

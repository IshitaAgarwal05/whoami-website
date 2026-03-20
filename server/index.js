const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const cachingService = require('./services/cachingService');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use(cors());
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
    console.log(`🔒 Rate limiting: ${cachingService.connected ? 'Redis-backed' : 'in-memory'}\n`);
});

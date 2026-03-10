const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const cachingService = require('./services/cachingService');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting Setup (Redis-backed)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => cachingService.client.sendCommand(args),
    }),
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});

// Stricter limiter for sensitive operations
const reloadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5, // Limit each IP to 5 requests per hour
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => cachingService.client.sendCommand(args),
    }),
    message: {
        success: false,
        error: 'Reload limit reached. Please wait an hour.'
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', limiter); // Apply global limiter to all /api routes

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/products/reload', reloadLimiter); // Apply stricter limit to reload
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'WhoAmI API Server is running with Redis Caching & Rate Limiting',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 WhoAmI API Server running on http://localhost:${PORT}`);
    console.log(`🔒 Security: Rate limiting enabled (Redis store)`);
    console.log(`⚡ Performance: Redis caching active`);
    console.log(`📊 API Endpoints:`);
    console.log(`   - GET  /api/products`);
    console.log(`   - GET  /api/products/:id`);
    console.log(`   - GET  /api/products/category/:category`);
    console.log(`   - GET  /api/products/categories`);
    console.log(`   - POST /api/products/reload (Rate limited)\n`);
});

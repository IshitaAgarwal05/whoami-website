const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cachingService = require('./services/cachingService');
const productRoutes = require('./routes/products');
const blogRoutes = require('./routes/blog');
const orderRoutes = require('./routes/orders');
const operationsRoutes = require('./routes/operations');

const app = express();
const PORT = process.env.PORT || 5001; // Default to 5001 as specified in .env.local

// Trust proxy for rate limiting (needed for Render/load balancers)
app.set('trust proxy', 1);

// -------------------------------------------------------------------
// CORS — restrict to allowed origins
// -------------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000, http://127.0.0.1:3000')
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
// Swagger/OpenAPI Configuration
// -------------------------------------------------------------------
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'WhoAmI Studios API',
            version: '1.0.0',
            description: 'API Documentation for WhoAmI Studios compatibility layer'
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api/v1`
            }
        ]
    },
    apis: [path.join(__dirname, 'routes/*.js')]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------------------------------------------------------
// Routes
// -------------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the WhoAmI API. Everything is running smoothly!',
        docs: '/api/v1/docs'
    });
});

// Versioned APIs (v1)
app.use('/api/v1/products/reload', reloadLimiter);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1', operationsRoutes);

// Legacy APIs (for backwards-compatibility with existing frontend)
app.use('/api/products/reload', reloadLimiter);
app.use('/api/products', productRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', operationsRoutes);

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
    console.log(`📖 Swagger API Docs available at http://localhost:${PORT}/api/v1/docs`);
    console.log(`🌐 CORS origins: ${allowedOrigins.join(', ')}\n`);
});

const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

/**
 * Auth middleware for protected routes.
 * Checks for RELOAD_API_KEY in x-api-key header.
 */
const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.RELOAD_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Provide a valid x-api-key header.' });
    }
    next();
};

/**
 * GET /api/products
 * Get all products
 */
router.get('/', async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

// Category endpoints removed as frontend derives categories dynamically from payloads.

/**
 * GET /api/products/combos
 * Get all curated combos
 */
router.get('/combos', async (req, res) => {
    try {
        const combos = await productService.getAllCombos();
        res.json({
            success: true,
            count: combos.length,
            data: combos
        });
    } catch (error) {
        console.error('Error fetching combos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch combos'
        });
    }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
});

/**
 * POST /api/products/reload
 * Clears the Redis cache so next requests pull fresh from Supabase
 */
router.post('/reload', requireApiKey, async (req, res) => {
    try {
        const result = await productService.clearCache();
        res.json({
            success: true,
            message: 'Cache invalidated. Next requests will fetch fresh from Supabase.',
            data: result
        });
    } catch (error) {
        console.error('Error reloading data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reload data'
        });
    }
});

module.exports = router;

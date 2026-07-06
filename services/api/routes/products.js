const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.RELOAD_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Provide a valid x-api-key header.' });
    }
    next();
};

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     description: Fetch products from Strapi v5 catalog sorted by featured order. Supports optional limit and offset pagination.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of products to skip
 *     responses:
 *       200:
 *         description: A JSON array of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 has_more:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : 0;
        
        const { data, has_more, total } = await productService.getAllProducts(limit, offset);
        res.json({
            success: true,
            count: data.length,
            total,
            has_more,
            data
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

/**
 * @openapi
 * /products/combos:
 *   get:
 *     summary: Retrieve curated combos
 *     description: Fetch all product combos from the Strapi catalog with optional Redis caching.
 *     responses:
 *       200:
 *         description: A JSON array of combo products.
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
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Retrieve a single product by ID
 *     description: Fetch a product detail object from catalog by its numeric or string ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product detail object.
 *       404:
 *         description: Product not found.
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
 * @openapi
 * /products/reload:
 *   post:
 *     summary: Invalidate product cache
 *     description: Clear Redis caches to force re-fetch of latest catalog from Strapi.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cache invalidated successfully.
 */
router.post('/reload', requireApiKey, async (req, res) => {
    try {
        const result = await productService.clearCache();
        res.json({
            success: true,
            message: 'Cache invalidated. Next requests will fetch fresh from Strapi.',
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

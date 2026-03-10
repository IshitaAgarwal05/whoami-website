const express = require('express');
const router = express.Router();
const excelService = require('../services/excelService');

/**
 * GET /api/products
 * Get all products
 */
router.get('/', async (req, res) => {
    try {
        const products = await excelService.getAllProducts();
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

/**
 * GET /api/products/categories
 * Get all unique categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await excelService.getCategories();
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

/**
 * GET /api/products/category/:category
 * Get products by category
 */
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await excelService.getProductsByCategory(category);
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products by category'
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
        const product = await excelService.getProductById(id);

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
 * Reload products from Excel file
 */
router.post('/reload', async (req, res) => {
    try {
        const products = await excelService.reloadProducts();
        res.json({
            success: true,
            message: 'Products reloaded successfully',
            count: products.length
        });
    } catch (error) {
        console.error('Error reloading products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reload products'
        });
    }
});

module.exports = router;

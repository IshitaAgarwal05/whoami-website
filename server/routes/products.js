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
 * GET /api/products/combos
 * Get all curated combos
 */
router.get('/combos', async (req, res) => {
    try {
        const combos = await excelService.getAllCombos();
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
 * Reload all products and combos from Excel files
 */
router.post('/reload', async (req, res) => {
    try {
        const counts = await excelService.reloadAll();
        res.json({
            success: true,
            message: 'All datasets reloaded successfully',
            data: counts
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

const XLSX = require('xlsx');
const path = require('path');
const cachingService = require('./cachingService');

class ExcelService {
    constructor() {
        this.excelFilePath = path.join(__dirname, '../data/products.xlsx');
        this.CACHE_KEY = 'whoami:products:all';
    }

    /**
     * Load products from Excel file with Redis caching
     * @param {boolean} forceReload - Force reload even if cache exists
     * @returns {Promise<Array>} Array of product objects
     */
    async loadProducts(forceReload = false) {
        // Try to get from Redis cache first
        if (!forceReload) {
            const cachedProducts = await cachingService.get(this.CACHE_KEY);
            if (cachedProducts) {
                console.log(`🚀 Serving ${cachedProducts.length} products from Redis cache`);
                return cachedProducts;
            }
        }

        try {
            console.log('📄 Reading products from Excel file...');
            // Read the Excel file
            const workbook = XLSX.readFile(this.excelFilePath);

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            let products = XLSX.utils.sheet_to_json(worksheet);

            // Transform Image URLs to .webp
            products = products.map(product => {
                if (product.ImageURL) {
                    product.ImageURL = product.ImageURL.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
                }
                return product;
            });

            // Save to Redis cache
            await cachingService.set(this.CACHE_KEY, products);

            console.log(`✅ Loaded ${products.length} products from Excel and updated Redis cache`);
            return products;
        } catch (error) {
            console.error('Error loading Excel file:', error);
            throw new Error('Failed to load product data from Excel file');
        }
    }

    /**
     * Get all products
     * @returns {Promise<Array>} All products
     */
    async getAllProducts() {
        return await this.loadProducts();
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object|null>} Product object or null if not found
     */
    async getProductById(id) {
        const products = await this.loadProducts();
        return products.find(product => product.ID === parseInt(id)) || null;
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Filtered products
     */
    async getProductsByCategory(category) {
        const products = await this.loadProducts();
        return products.filter(product =>
            product.Category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Get all unique categories
     * @returns {Promise<Array>} Array of category names
     */
    async getCategories() {
        const products = await this.loadProducts();
        const categories = [...new Set(products.map(p => p.Category))];
        return categories;
    }

    /**
     * Reload products from Excel file
     * @returns {Promise<Array>} Refreshed products array
     */
    async reloadProducts() {
        console.log('♻️ Forcing reload of products from Excel...');
        return await this.loadProducts(true);
    }
}

// Export singleton instance
module.exports = new ExcelService();

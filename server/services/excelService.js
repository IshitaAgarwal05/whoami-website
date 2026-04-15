const XLSX = require('xlsx');
const path = require('path');
const cachingService = require('./cachingService');

class ExcelService {
    constructor() {
        this.productsFilePath = path.join(__dirname, '../data/products.xlsx');
        this.combosFilePath = path.join(__dirname, '../data/combos.xlsx');
        this.PRODUCTS_CACHE_KEY = 'whoami:products:all';
        this.COMBOS_CACHE_KEY = 'whoami:products:combos';
    }

    /**
     * Load data from a specific Excel file with Redis caching
     * @param {string} filePath - Path to Excel file
     * @param {string} cacheKey - Redis cache key
     * @param {boolean} forceReload - Force reload even if cache exists
     * @returns {Promise<Array>} Array of data objects
     */
    async loadData(filePath, cacheKey, forceReload = false) {
        // Try to get from Redis cache first
        if (!forceReload) {
            const cachedData = await cachingService.get(cacheKey);
            if (cachedData) {
                console.log(`🚀 Serving ${cachedData.length} items from Redis cache [${cacheKey}]`);
                return cachedData;
            }
        }

        try {
            console.log(`📄 Reading data from Excel file: ${path.basename(filePath)}...`);
            // Read the Excel file
            const workbook = XLSX.readFile(filePath);

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            let data = XLSX.utils.sheet_to_json(worksheet);

            // Transform Image URLs to .webp
            data = data.map(item => {
                if (item.ImageURL) {
                    item.ImageURL = item.ImageURL.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
                }
                return item;
            });

            // Save to Redis cache
            await cachingService.set(cacheKey, data);

            console.log(`✅ Loaded ${data.length} items from Excel and updated Redis cache [${cacheKey}]`);
            return data;
        } catch (error) {
            console.error(`Error loading Excel file ${filePath}:`, error);
            throw new Error(`Failed to load data from ${path.basename(filePath)}`);
        }
    }

    /**
     * Get all products
     * @returns {Promise<Array>} All products
     */
    async getAllProducts() {
        return await this.loadData(this.productsFilePath, this.PRODUCTS_CACHE_KEY);
    }

    /**
     * Get all combos
     * @returns {Promise<Array>} All combos
     */
    async getAllCombos() {
        return await this.loadData(this.combosFilePath, this.COMBOS_CACHE_KEY);
    }

    /**
     * Get product by ID (searches in both products and combos)
     * @param {number} id - Product ID
     * @returns {Promise<Object|null>} Product/Combo object or null if not found
     */
    async getProductById(id) {
        const [products, combos] = await Promise.all([
            this.getAllProducts(),
            this.getAllCombos()
        ]);
        const targetId = parseInt(id);
        return products.find(p => p.ID === targetId) || combos.find(c => c.ID === targetId) || null;
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Filtered products
     */
    async getProductsByCategory(category) {
        const products = await this.getAllProducts();
        return products.filter(product =>
            product.Category && product.Category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Get all unique categories
     * @returns {Promise<Array>} Array of category names
     */
    async getCategories() {
        const products = await this.getAllProducts();
        const categories = [...new Set(products.map(p => p.Category).filter(Boolean))];
        return categories;
    }

    /**
     * Reload both products and combos from Excel files
     * @returns {Promise<{products: number, combos: number}>} Refreshed counts
     */
    async reloadAll() {
        console.log('♻️ Forcing reload of all data from Excel files...');
        const [products, combos] = await Promise.all([
            this.loadData(this.productsFilePath, this.PRODUCTS_CACHE_KEY, true),
            this.loadData(this.combosFilePath, this.COMBOS_CACHE_KEY, true)
        ]);
        return {
            products: products.length,
            combos: combos.length
        };
    }
}

// Export singleton instance
module.exports = new ExcelService();

const XLSX = require('xlsx');
const path = require('path');

class ExcelService {
    constructor() {
        this.productsCache = null;
        this.lastLoadTime = null;
        this.excelFilePath = path.join(__dirname, '../data/products.xlsx');
    }

    /**
     * Load products from Excel file
     * @param {boolean} forceReload - Force reload even if cache exists
     * @returns {Array} Array of product objects
     */
    loadProducts(forceReload = false) {
        // Return cached data if available and not forcing reload
        if (this.productsCache && !forceReload) {
            return this.productsCache;
        }

        try {
            // Read the Excel file
            const workbook = XLSX.readFile(this.excelFilePath);

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const products = XLSX.utils.sheet_to_json(worksheet);

            // Cache the products
            this.productsCache = products;
            this.lastLoadTime = new Date();

            console.log(`Loaded ${products.length} products from Excel`);
            return products;
        } catch (error) {
            console.error('Error loading Excel file:', error);
            throw new Error('Failed to load product data from Excel file');
        }
    }

    /**
     * Get all products
     * @returns {Array} All products
     */
    getAllProducts() {
        return this.loadProducts();
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Object|null} Product object or null if not found
     */
    getProductById(id) {
        const products = this.loadProducts();
        return products.find(product => product.ID === parseInt(id)) || null;
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Array} Filtered products
     */
    getProductsByCategory(category) {
        const products = this.loadProducts();
        return products.filter(product =>
            product.Category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Get all unique categories
     * @returns {Array} Array of category names
     */
    getCategories() {
        const products = this.loadProducts();
        const categories = [...new Set(products.map(p => p.Category))];
        return categories;
    }

    /**
     * Reload products from Excel file
     * @returns {Array} Refreshed products array
     */
    reloadProducts() {
        console.log('Reloading products from Excel...');
        return this.loadProducts(true);
    }
}

// Export singleton instance
module.exports = new ExcelService();

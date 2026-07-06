const axios = require('axios');
const cachingService = require('./cachingService');

const STRAPI_BASE = process.env.STRAPI_API_URL || 'http://localhost:1337';

class ProductService {
    formatProduct(p) {
        if (!p) return null;
        
        let imageUrl = '';
        if (p.thumbnail && p.thumbnail.url) {
            imageUrl = p.thumbnail.url.startsWith('http') ? p.thumbnail.url : `${STRAPI_BASE}${p.thumbnail.url}`;
        } else if (p.gallery && p.gallery.length > 0 && p.gallery[0].url) {
            imageUrl = p.gallery[0].url.startsWith('http') ? p.gallery[0].url : `${STRAPI_BASE}${p.gallery[0].url}`;
        } else {
            imageUrl = '/products/placeholder.webp';
        }

        return {
            ID: p.id,
            Name: p.name,
            Description: p.description || '',
            Price: Number(p.selling_price || p.mrp || 0),
            OriginalPrice: Number(p.mrp || 0),
            Category: p.category?.name || 'Uncategorized',
            Material: p.material || '',
            ImageURL: imageUrl,
            Stock: p.stock || 0,
            UseCase: p.search_keywords || '',
            Dimensions: p.dimensions || '',
            Weight: Number(p.weight || 0),
            SKU: p.sku || ''
        };
    }

    async getAllProducts(limit = null, offset = 0) {
        try {
            // Build URL with pagination and population
            let url = `${STRAPI_BASE}/api/products?populate=*&sort=featured_order:asc,id:asc`;
            if (limit !== null) {
                const page = Math.floor(offset / limit) + 1;
                url += `&pagination[page]=${page}&pagination[pageSize]=${limit}`;
            } else {
                url += `&pagination[limit]=100`;
            }

            const response = await axios.get(url);
            const data = response.data.data || [];
            const meta = response.data.meta || {};

            const formattedData = data.map(p => this.formatProduct(p));
            const total = meta.pagination?.total || data.length;
            const has_more = limit !== null ? (offset + data.length < total) : false;

            return {
                data: formattedData,
                has_more,
                total
            };
        } catch (error) {
            console.error('Error fetching products from Strapi:', error.message);
            return { data: [], has_more: false, total: 0 };
        }
    }

    async getAllCombos() {
        try {
            const cacheKey = 'combos:all';
            const cached = await cachingService.get(cacheKey);
            if (cached) return cached;

            // Fetch products under Combos category
            const url = `${STRAPI_BASE}/api/products?filters[category][name][$eq]=Combos&populate=*`;
            const response = await axios.get(url);
            const data = response.data.data || [];

            const formattedData = data.map(p => {
                const base = this.formatProduct(p);
                return {
                    ...base,
                    Items: p.variants?.items || [], // map items array if defined in JSON field
                    Category: 'Combos'
                };
            });

            await cachingService.set(cacheKey, formattedData, 3600);
            return formattedData;
        } catch (error) {
            console.error('Error fetching combos from Strapi:', error.message);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const [productsRes, combos] = await Promise.all([
                this.getAllProducts(),
                this.getAllCombos()
            ]);
            
            const products = productsRes.data;
            const numericId = parseInt(id);
            const isNumeric = !isNaN(numericId);

            return products.find(p => isNumeric ? p.ID === numericId : String(p.ID) === String(id))
                || combos.find(c => isNumeric ? c.ID === numericId : String(c.ID) === String(id))
                || null;
        } catch (error) {
            console.error('Error fetching product by ID:', error.message);
            return null;
        }
    }

    async clearCache() {
        await cachingService.del('products:all');
        await cachingService.del('combos:all');
        return { message: 'Product cache cleared successfully' };
    }
}

module.exports = new ProductService();

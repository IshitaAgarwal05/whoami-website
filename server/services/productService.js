const supabase = require('../db/supabaseClient');
const cachingService = require('./cachingService');

class ProductService {
    async getAllProducts() {
        if (!supabase) return [];
        
        try {
            const cacheKey = 'products:all';
            const cached = await cachingService.get(cacheKey);
            if (cached) return cached;
            
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('price', { ascending: true });
                
            if (error) throw error;
            
            // Map the Supabase data to match the old format to prevent frontend breakage
            const formattedData = data.map(p => ({
                ID: isNaN(parseInt(p.internal_id)) ? p.internal_id : parseInt(p.internal_id),
                Name: p.name,
                Description: p.description,
                Price: p.price,
                OriginalPrice: p.original_price, // Added
                Category: p.category,
                Material: p.material,
                ImageURL: p.image_url,
                Stock: p.stock,
                UseCase: p.use_case, // Added
                Dimensions: p.dimensions, // Added
                Weight: p.weight // Added
            }));

            await cachingService.set(cacheKey, formattedData, 3600); // Cache for 1 hour
            return formattedData;
        } catch (error) {
            console.error('Error fetching products from Supabase:', error);
            return [];
        }
    }

    async getAllCombos() {
        if (!supabase) return [];
        
        try {
            const cacheKey = 'combos:all';
            const cached = await cachingService.get(cacheKey);
            if (cached) return cached;
            
            const { data, error } = await supabase
                .from('combos')
                .select('*')
                .eq('is_active', true);
                
            if (error) throw error;
            
            // Map the Supabase data to match the old format
            const formattedData = data.map(c => ({
                ID: isNaN(parseInt(c.internal_id)) ? c.internal_id : parseInt(c.internal_id), 
                Name: c.name,
                Description: c.description,
                Price: c.price,
                OriginalPrice: c.original_price,
                ImageURL: c.image_url,
                Items: c.items // Array of string IDs
            }));

            await cachingService.set(cacheKey, formattedData, 3600);
            return formattedData;
        } catch (error) {
            console.error('Error fetching combos from Supabase:', error);
            return [];
        }
    }

    async getProductById(id) {
        if (!supabase) return null;
        
        const [products, combos] = await Promise.all([
            this.getAllProducts(),
            this.getAllCombos()
        ]);
        
        // Support both numeric and string IDs
        const numericId = parseInt(id);
        const isNumeric = !isNaN(numericId);
        return products.find(p => isNumeric ? p.ID === numericId : String(p.ID) === String(id))
            || combos.find(c => isNumeric ? c.ID === numericId : String(c.ID) === String(id))
            || null;
    }

    async clearCache() {
        const cachingService = require('./cachingService');
        await cachingService.del('products:all');
        await cachingService.del('combos:all');
        return { message: 'Product cache cleared successfully' };
    }
}

module.exports = new ProductService();

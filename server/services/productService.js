const supabase = require('../db/supabaseClient');
const cachingService = require('./cachingService');

class ProductService {
    async getAllProducts(limit = null, offset = 0) {
        if (!supabase) return { data: [], has_more: false };
        
        try {
            // For now, bypass cache if paginating to ensure accuracy, or cache by params
            let query = supabase
                .from('products')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: true });

            if (limit !== null) {
                query = query.range(offset, offset + limit - 1);
            }

            const { data, error, count } = await query;
                
            if (error) throw error;
            
            const formattedData = data.map(p => ({
                ID: isNaN(parseInt(p.internal_id)) ? p.internal_id : parseInt(p.internal_id),
                Name: p.name,
                Description: p.description,
                Price: p.price,
                OriginalPrice: p.original_price,
                Category: p.category,
                Material: p.material,
                ImageURL: p.image_url,
                Stock: p.stock,
                UseCase: p.use_case,
                Dimensions: p.dimensions,
                Weight: p.weight
            }));

            const has_more = limit !== null ? (offset + data.length < count) : false;

            return {
                data: formattedData,
                has_more,
                total: count
            };
        } catch (error) {
            console.error('Error fetching products from Supabase:', error);
            return { data: [], has_more: false, total: 0 };
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
                Items: c.items, // Array of string IDs
                Category: 'Combos'
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
        
        const [productsRes, combos] = await Promise.all([
            this.getAllProducts(),
            this.getAllCombos()
        ]);
        
        const products = productsRes.data;
        
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

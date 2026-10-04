const path = require('path');
const fs = require('fs');
const supabase = require('../db/supabaseClient');
const cachingService = require('./cachingService');

/**
 * Given an image_url (folder path OR file path), resolves the first .webp
 * thumbnail on disk so the API can return a concrete ImageURL to clients
 * that cannot use Node fs (e.g. React client components).
 *
 * Supports:
 *   "/products/thing/"             -> /products/thing/thing.webp
 *   "/products/thing"              -> /products/thing/thing.webp
 *   "/products/thing/thing.webp"   -> /products/thing/thing.webp  (already resolved)
 */
function resolveFirstImage(imageUrl) {
    if (!imageUrl) return null;

    const isFolderPath = imageUrl.endsWith('/') || !imageUrl.includes('.');

    if (!isFolderPath) return imageUrl; // already a direct file

    const folderUrl = imageUrl.replace(/\/$/, '');
    const folderPath = path.join(process.cwd(), '..', 'public', ...folderUrl.split('/').filter(Boolean));

    try {
        if (!fs.existsSync(folderPath)) return null;

        const files = fs.readdirSync(folderPath)
            .filter(f => f.toLowerCase().endsWith('.webp'))
            .sort((a, b) => {
                const getNum = (n) => { const m = n.match(/(\d+)/); return m ? parseInt(m[1]) : Infinity; };
                const numDiff = getNum(a) - getNum(b);
                return numDiff !== 0 ? numDiff : a.localeCompare(b);
            });

        return files.length > 0 ? `${folderUrl}/${files[0]}` : null;
    } catch (e) {
        return null;
    }
}

class ProductService {
    async getAllProducts(limit = null, offset = 0) {
        if (!supabase) return { data: [], has_more: false };
        
        try {
            // Sort newest first by default
            let query = supabase
                .from('products')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .order('internal_id', { ascending: false });

            if (limit !== null) {
                query = query.range(offset, offset + limit - 1);
            }

            const { data, error, count } = await query;
                
            if (error) throw error;
            
            const formattedData = data.map(p => {
                const resolvedImage = resolveFirstImage(p.image_url);
                return {
                    ID: isNaN(parseInt(p.internal_id)) ? p.internal_id : parseInt(p.internal_id),
                    Name: p.name,
                    Description: p.description,
                    Price: p.price,
                    OriginalPrice: p.original_price,
                    Category: p.category,
                    Material: p.material,
                    // ImageURL is always a concrete file path (for ProductCard thumbnails etc.)
                    ImageURL: resolvedImage,
                    // FolderURL is the folder path for the detail page to discover all images
                    FolderURL: p.image_url,
                    Stock: p.stock,
                    UseCase: p.use_case,
                    Dimensions: p.dimensions,
                    Weight: p.weight,
                    CreatedAt: p.created_at
                };
            });

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
                .eq('is_active', true)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            // Map the Supabase data to match the old format
            const formattedData = data.map(c => {
                const resolvedImage = resolveFirstImage(c.image_url);
                return {
                    ID: isNaN(parseInt(c.internal_id)) ? c.internal_id : parseInt(c.internal_id), 
                    Name: c.name,
                    Description: c.description,
                    Price: c.price,
                    OriginalPrice: c.original_price,
                    ImageURL: resolvedImage,
                    FolderURL: c.image_url,
                    Items: c.items, // Array of string IDs
                    Category: 'Combos',
                    CreatedAt: c.created_at
                };
            });

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

const axios = require('axios');

const STRAPI_BASE = 'http://localhost:1337';

async function seed() {
    try {
        console.log('🚀 Starting to seed additional products to Strapi...');
        
        // 1. Create or fetch Categories
        const newCategories = [
            { name: 'Personalized Gifts', description: 'Customizable products made just for you by WhoAmI Studios' },
            { name: 'Charms', description: 'Collect your charms' },
            { name: 'Keychains', description: 'Unique Keychains' },
            { name: 'Book Nooks', description: 'Magical Book Nooks' },
            { name: 'Collectibles', description: 'Premium Collectibles' }
        ];

        const categoryMap = {}; // name -> id
        console.log('\n--- Processing Categories ---');
        for (const cat of newCategories) {
            try {
                const fetchRes = await axios.get(`${STRAPI_BASE}/api/categorys?filters[name][$eq]=${encodeURIComponent(cat.name)}`);
                if (fetchRes.data.data && fetchRes.data.data.length > 0) {
                    const existing = fetchRes.data.data[0];
                    categoryMap[cat.name] = existing.documentId || existing.id;
                    console.log(` ✅ Found existing category: "${cat.name}"`);
                } else {
                    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    const response = await axios.post(`${STRAPI_BASE}/api/categorys`, {
                        data: {
                            name: cat.name,
                            slug: slug,
                            description: cat.description
                        }
                    });
                    
                    const created = response.data.data;
                    categoryMap[cat.name] = created.documentId || created.id;
                    
                    // Publish the category
                    await axios.post(`${STRAPI_BASE}/api/categorys/${categoryMap[cat.name]}/actions/publish`);
                    console.log(` 🌟 Created & Published category: "${cat.name}"`);
                }
            } catch (err) {
                console.error(` ❌ Failed to process category "${cat.name}":`, err.response?.data || err.message);
            }
        }

        const newProducts = [
            { name: 'Letter & Name Model', sku: 'PERS-010', category: 'Personalized Gifts', mrp: 799, selling_price: 599, dimensions: '8cm × 8cm × 2.5cm' },
            { name: 'Duck Charm', sku: 'CHRM-001', category: 'Charms', mrp: 39, selling_price: 29 },
            { name: 'Ghost Charm 1', sku: 'CHRM-002', category: 'Charms', mrp: 39, selling_price: 29 },
            { name: 'Ghost Charm 2', sku: 'CHRM-003', category: 'Charms', mrp: 39, selling_price: 29 },
            { name: 'Ghost Charm 3', sku: 'CHRM-004', category: 'Charms', mrp: 39, selling_price: 29 },
            { name: 'Toothless Keychain', sku: 'KEY-001', category: 'Keychains', mrp: 149, selling_price: 99 },
            { name: 'Mind Flayer', sku: 'COLL-001', category: 'Collectibles', mrp: 799, selling_price: 599 },
            { name: 'Spider-Man Noir', sku: 'COLL-002', category: 'Collectibles', mrp: 499, selling_price: 299 },
            { name: 'Hogwarts Charm', sku: 'CHRM-005', category: 'Charms', mrp: 39, selling_price: 29 },
            { name: 'Heart Charm', sku: 'CHRM-006', category: 'Charms', mrp: 39, selling_price: 29 },
            { name: 'Cavern Book Nook', sku: 'BOOK-001', category: 'Book Nooks', mrp: 1499, selling_price: 1199 },
            { name: 'Dobby Phone Charm', sku: 'CHRM-007', category: 'Charms', mrp: 199, selling_price: 149 },
            { name: 'AT-AT Flexi', sku: 'CHRM-008', category: 'Charms', mrp: 199, selling_price: 149 }
        ];

        console.log('\n--- Processing Products ---');
        for (const p of newProducts) {
            try {
                const fetchRes = await axios.get(`${STRAPI_BASE}/api/products?filters[sku][$eq]=${p.sku}`);
                if (fetchRes.data.data && fetchRes.data.data.length > 0) {
                    const existing = fetchRes.data.data[0];
                    console.log(` ✅ Found existing product: "${p.name}" (SKU: ${p.sku})`);
                    // Ensure it's published
                    try {
                        await axios.post(`${STRAPI_BASE}/api/products/${existing.documentId}/actions/publish`);
                        console.log(`    - Published product: "${p.name}"`);
                    } catch(e) {} // Might already be published
                } else {
                    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    const productData = {
                        name: p.name,
                        slug: slug,
                        description: `Premium quality ${p.name}. Made to order.`,
                        mrp: p.mrp,
                        selling_price: p.selling_price,
                        sku: p.sku,
                        stock: 50,
                        status: 'published', // Handled by action publish in Strapi v5
                        customizable: p.category === 'Personalized Gifts'
                    };

                    if (p.dimensions) productData.dimensions = p.dimensions;
                    if (categoryMap[p.category]) productData.category = categoryMap[p.category];

                    const response = await axios.post(`${STRAPI_BASE}/api/products`, { data: productData });
                    const created = response.data.data;
                    
                    // Publish the product
                    await axios.post(`${STRAPI_BASE}/api/products/${created.documentId || created.id}/actions/publish`);
                    console.log(` 🌟 Created & Published product: "${p.name}"`);
                }
            } catch (err) {
                console.error(` ❌ Failed to process product "${p.name}":`, err.response?.data || err.message);
            }
        }
        console.log('\n✅ Additional seeding completed successfully!');
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
    }
}

seed();

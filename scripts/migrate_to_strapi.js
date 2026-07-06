const fs = require('fs');
const path = require('path');
const axios = require('axios');

const STRAPI_BASE = 'http://localhost:1337';
const backupPath = path.join(__dirname, '../database/backup_legacy.json');

async function migrate() {
    try {
        console.log('🚀 Starting content migration to Strapi...');
        
        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Backup file not found at ${backupPath}. Please run backup first.`);
            process.exit(1);
        }

        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const { products = [], combos = [], blogs = [] } = backupData;

        // 1. Create Categories
        console.log('1. Creating Categories...');
        const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
        // Add Combos category
        uniqueCategories.push('Combos');

        const categoryMap = {}; // name -> id/documentId
        for (const catName of uniqueCategories) {
            try {
                const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                
                const response = await axios.post(`${STRAPI_BASE}/api/categorys`, {
                    data: {
                        name: catName,
                        slug: slug,
                        description: `${catName} category`
                    }
                });
                
                const created = response.data.data;
                categoryMap[catName] = created.documentId || created.id;
                console.log(` - Created category: "${catName}"`);
            } catch (err) {
                // If it already exists, fetch it
                try {
                    const fetchRes = await axios.get(`${STRAPI_BASE}/api/categorys?filters[name][$eq]=${encodeURIComponent(catName)}`);
                    if (fetchRes.data.data && fetchRes.data.data.length > 0) {
                        const existing = fetchRes.data.data[0];
                        categoryMap[catName] = existing.documentId || existing.id;
                        console.log(` - Re-mapped existing category: "${catName}"`);
                    } else {
                        console.warn(` ⚠️ Could not fetch existing category "${catName}"`);
                    }
                } catch (fetchErr) {
                    console.warn(` ⚠️ Failed to fetch existing category "${catName}":`, fetchErr.message);
                }
            }
        }

        // Helper to check if entity already exists by slug
        async function checkExists(type, slug) {
            try {
                const res = await axios.get(`${STRAPI_BASE}/api/${type}?filters[slug][$eq]=${slug}`);
                return res.data.data && res.data.data.length > 0;
            } catch {
                return false;
            }
        }

        // 2. Create Products
        console.log('2. Creating Products...');
        for (const p of products) {
            try {
                const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                
                if (await checkExists('products', slug)) {
                    console.log(` - Product already exists: "${p.name}" (skipping)`);
                    continue;
                }

                const productData = {
                    name: p.name,
                    slug: slug,
                    description: p.description,
                    mrp: Number(p.original_price || p.price || 0),
                    selling_price: Number(p.price || 0),
                    sku: p.internal_id || `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    stock: p.stock || 10,
                    material: p.material || '',
                    dimensions: p.dimensions || '',
                    weight: p.weight ? Number(p.weight.replace(/[^0-9.]/g, '')) : 0,
                    search_keywords: p.use_case || '',
                    customizable: false,
                    status: 'published'
                };

                if (p.category && categoryMap[p.category]) {
                    productData.category = categoryMap[p.category];
                }

                if (p.image_url) {
                    productData.thumbnail = {
                        url: p.image_url
                    };
                }

                await axios.post(`${STRAPI_BASE}/api/products`, {
                    data: productData
                });
                console.log(` - Created product: "${p.name}"`);
            } catch (err) {
                console.error(` ❌ Failed to migrate product "${p.name}":`, err.response?.data || err.message);
            }
        }

        // 3. Create Combos
        console.log('3. Creating Combos...');
        for (const c of combos) {
            try {
                const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                
                if (await checkExists('products', slug)) {
                    console.log(` - Combo already exists: "${c.name}" (skipping)`);
                    continue;
                }

                const comboData = {
                    name: c.name,
                    slug: slug,
                    description: c.description,
                    mrp: Number(c.original_price || c.price || 0),
                    selling_price: Number(c.price || 0),
                    sku: c.internal_id || `CB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    stock: 5,
                    status: 'published',
                    variants: {
                        items: c.items || []
                    }
                };

                if (categoryMap['Combos']) {
                    comboData.category = categoryMap['Combos'];
                }

                if (c.image_url) {
                    comboData.thumbnail = {
                        url: c.image_url
                    };
                }

                await axios.post(`${STRAPI_BASE}/api/products`, {
                    data: comboData
                });
                console.log(` - Created Combo: "${c.name}"`);
            } catch (err) {
                console.error(` ❌ Failed to migrate combo "${c.name}":`, err.response?.data || err.message);
            }
        }

        // 4. Create Blogs
        console.log('4. Creating Blogs...');
        for (const b of blogs) {
            try {
                if (await checkExists('blogs', b.id)) {
                    console.log(` - Blog already exists: "${b.title}" (skipping)`);
                    continue;
                }

                let formattedDate = new Date().toISOString().split('T')[0];
                if (b.date) {
                    const parsedDate = new Date(b.date);
                    if (!isNaN(parsedDate.getTime())) {
                        formattedDate = parsedDate.toISOString().split('T')[0];
                    }
                }

                const blogData = {
                    title: b.title,
                    slug: b.id,
                    excerpt: b.excerpt,
                    content: b.content,
                    date: formattedDate,
                    reading_time: b.readingTime || '3 min read',
                    tags: b.tags || []
                };

                if (b.image) {
                    blogData.image = {
                        url: b.image
                    };
                }

                await axios.post(`${STRAPI_BASE}/api/blogs`, {
                    data: blogData
                });
                console.log(` - Created Blog: "${b.title}"`);
            } catch (err) {
                console.error(` ❌ Failed to migrate blog "${b.title}":`, err.response?.data || err.message);
            }
        }

        console.log('✅ Content migration completed successfully!');
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
        process.exit(1);
    }
}

migrate();

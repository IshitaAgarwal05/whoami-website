const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/whoami'
});

const excelFilePath = path.join(__dirname, '../data/products.xlsx');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting data migration from Excel to PostgreSQL...');

        // Read Excel
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0];
        const products = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`📊 Found ${products.length} products to migrate.`);

        // Clear existing data (optional, but good for clean migration)
        await client.query('TRUNCATE TABLE products RESTART IDENTITY');

        for (const product of products) {
            // Transform Image URL to WebP
            let imageUrl = product.ImageURL || '';
            if (imageUrl) {
                imageUrl = imageUrl.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
            }

            const query = {
                text: `INSERT INTO products (name, category, description, price, material, image_url) 
                       VALUES ($1, $2, $3, $4, $5, $6)`,
                values: [
                    product.Name,
                    product.Category,
                    product.Description,
                    product.Price,
                    product.Material,
                    imageUrl
                ],
            };

            await client.query(query);
        }

        console.log('✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
};

migrate();

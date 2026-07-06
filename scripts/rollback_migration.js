const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/whoami';

async function rollback() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('🔄 Reverting migration... Connecting to database:', client.database);

        // Truncate tables created by Strapi
        const tables = [
            'products',
            'categorys',
            'blogs',
            'products_category_lnk',
            'products_collection_lnk'
        ];

        for (const table of tables) {
            try {
                await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`);
                console.log(` - Truncated table "${table}"`);
            } catch (err) {
                // If table doesn't exist yet, ignore
                console.warn(` ⚠️ Table "${table}" could not be truncated (maybe not created yet):`, err.message);
            }
        }
        
        console.log('✅ Migration reverted successfully!');
    } catch (e) {
        console.error('❌ Rollback failed:', e.message);
    } finally {
        await client.end();
    }
}

rollback();

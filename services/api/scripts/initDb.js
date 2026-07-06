const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/whoami'
});

const createSchema = async () => {
    const client = await pool.connect();
    try {
        console.log('🏗️ Creating PostgreSQL schema...');

        // Drop table if exists for clean start (careful in production!)
        // await client.query('DROP TABLE IF EXISTS products');

        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                material VARCHAR(100),
                image_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        `);

        console.log('✅ Schema created successfully');
    } catch (err) {
        console.error('❌ Error creating schema:', err);
    } finally {
        client.release();
        await pool.end();
    }
};

createSchema();

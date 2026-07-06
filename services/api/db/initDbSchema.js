const db = require('./postgresClient');

async function initSchema() {
    try {
        console.log('🏗️ Initializing transactional database tables in PostgreSQL (tx_ prefix)...');

        // Customers Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tx_customers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                address JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(' - Created table "tx_customers"');

        // Orders Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tx_orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_number VARCHAR(100) UNIQUE NOT NULL,
                customer_id UUID REFERENCES tx_customers(id),
                status VARCHAR(50) DEFAULT 'unfulfilled',
                payment_status VARCHAR(50) DEFAULT 'pending',
                payment_method VARCHAR(100),
                payment_reference_id VARCHAR(255),
                shipping_address JSONB,
                billing_address JSONB,
                tax_breakdown JSONB,
                shipping_charges DECIMAL(10, 2) DEFAULT 0.00,
                discount_applied DECIMAL(10, 2) DEFAULT 0.00,
                coupon_used VARCHAR(100),
                invoice_number VARCHAR(100),
                packing_status VARCHAR(50) DEFAULT 'pending',
                timeline JSONB DEFAULT '[]'::jsonb,
                internal_notes TEXT,
                customer_notes TEXT,
                items JSONB NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(' - Created table "tx_orders"');

        // Inventory Transactions Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tx_inventory_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_sku VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL CHECK (type IN ('incoming', 'outgoing', 'manual_adjustment', 'sale', 'return')),
                quantity INTEGER NOT NULL,
                reference_id VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(' - Created table "tx_inventory_transactions"');

        // Audit Logs Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tx_audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_email VARCHAR(255),
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(100),
                entity_id VARCHAR(255),
                changes JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(' - Created table "tx_audit_logs"');

        // Contact Submissions Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tx_contact_submissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                assigned_to VARCHAR(255),
                resolved BOOLEAN DEFAULT false,
                archived BOOLEAN DEFAULT false,
                reply_status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(' - Created table "tx_contact_submissions"');

        // Newsletter Subscribers Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tx_newsletter_subscribers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            );
        `);
        console.log(' - Created table "tx_newsletter_subscribers"');

        console.log('✅ Transactional PostgreSQL tables initialized successfully!');
    } catch (e) {
        console.error('❌ Failed to initialize schema:', e);
        process.exit(1);
    }
}

if (require.main === module) {
    initSchema().then(() => process.exit(0));
}

module.exports = initSchema;

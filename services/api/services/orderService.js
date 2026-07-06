const db = require('../db/postgresClient');
const axios = require('axios');

const STRAPI_BASE = process.env.STRAPI_API_URL || 'http://localhost:1337';

class OrderService {
    async createOrder(orderData) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const {
                email,
                first_name,
                last_name,
                phone,
                shipping_address = {},
                billing_address = {},
                items = [],
                total_amount,
                payment_method,
                payment_reference_id,
                coupon_used = null,
                discount_applied = 0.00,
                shipping_charges = 0.00,
                tax_breakdown = {}
            } = orderData;

            // 1. Get or create Customer
            let customerId;
            const customerCheck = await client.query(
                'SELECT id FROM tx_customers WHERE email = $1',
                [email]
            );

            if (customerCheck.rows.length > 0) {
                customerId = customerCheck.rows[0].id;
                // Update customer details if provided
                await client.query(
                    'UPDATE tx_customers SET first_name = $1, last_name = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
                    [first_name, last_name, phone, JSON.stringify(shipping_address), customerId]
                );
            } else {
                const customerInsert = await client.query(
                    'INSERT INTO tx_customers (first_name, last_name, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [first_name, last_name, email, phone, JSON.stringify(shipping_address)]
                );
                customerId = customerInsert.rows[0].id;
            }

            // 2. Generate unique order number
            const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const timeline = JSON.stringify([
                { status: 'unfulfilled', note: 'Order placed successfully', timestamp: new Date().toISOString() }
            ]);

            // 3. Create Order
            const orderInsert = await client.query(
                `INSERT INTO tx_orders (
                    order_number, customer_id, status, payment_status, payment_method, payment_reference_id,
                    shipping_address, billing_address, tax_breakdown, shipping_charges, discount_applied,
                    coupon_used, timeline, items, total_amount
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
                [
                    orderNumber, customerId, 'unfulfilled', 'paid', payment_method, payment_reference_id,
                    JSON.stringify(shipping_address), JSON.stringify(billing_address), JSON.stringify(tax_breakdown),
                    shipping_charges, discount_applied, coupon_used, timeline, JSON.stringify(items), total_amount
                ]
            );
            const order = orderInsert.rows[0];

            // 4. Update inventory and register transactions
            for (const item of items) {
                const { product_sku, quantity } = item;

                // Log inventory transaction in Postgres
                await client.query(
                    'INSERT INTO tx_inventory_transactions (product_sku, type, quantity, reference_id, notes) VALUES ($1, $2, $3, $4, $5)',
                    [product_sku, 'sale', -quantity, orderNumber, `Sale from order ${orderNumber}`]
                );

                // Synchronize inventory in Strapi
                try {
                    // Fetch product by SKU
                    const productRes = await axios.get(`${STRAPI_BASE}/api/products?filters[sku][$eq]=${encodeURIComponent(product_sku)}`);
                    if (productRes.data.data && productRes.data.data.length > 0) {
                        const strapiProduct = productRes.data.data[0];
                        const currentStock = Number(strapiProduct.stock || 0);
                        const newStock = Math.max(0, currentStock - quantity);
                        const docId = strapiProduct.documentId || strapiProduct.id;

                        // Update product stock in Strapi
                        await axios.put(`${STRAPI_BASE}/api/products/${docId}`, {
                            data: {
                                stock: newStock
                            }
                        });

                        // Create transaction log in Strapi for the admin dashboard/audit view
                        await axios.post(`${STRAPI_BASE}/api/inventory-transactions`, {
                            data: {
                                product_sku,
                                type: 'sale',
                                quantity: -quantity,
                                reference_id: orderNumber,
                                notes: `Sale from order ${orderNumber}`
                            }
                        });
                    }
                } catch (strapiErr) {
                    console.error(`⚠️ Failed to update Strapi stock for SKU ${product_sku}:`, strapiErr.message);
                }
            }

            // 5. Create Audit Log
            await client.query(
                'INSERT INTO tx_audit_logs (user_email, action, entity_type, entity_id, changes) VALUES ($1, $2, $3, $4, $5)',
                [email, 'ORDER_CREATED', 'order', orderNumber, JSON.stringify({ order_number: orderNumber, total_amount })]
            );

            // Create Audit Log in Strapi for unified dashboard visibility
            try {
                await axios.post(`${STRAPI_BASE}/api/audit-logs`, {
                    data: {
                        user_email: email,
                        action: 'ORDER_CREATED',
                        entity_type: 'order',
                        entity_id: orderNumber,
                        changes: { order_number: orderNumber, total_amount }
                    }
                });

                // Create Order record in Strapi for custom dashboard aggregates
                await axios.post(`${STRAPI_BASE}/api/orders`, {
                    data: {
                        order_number: orderNumber,
                        status: 'unfulfilled',
                        payment_status: 'paid',
                        payment_method,
                        payment_reference_id,
                        total_amount,
                        items: items
                    }
                });

                // Create/update customer record in Strapi
                await axios.post(`${STRAPI_BASE}/api/customers`, {
                    data: {
                        first_name,
                        last_name,
                        email,
                        phone
                    }
                }).catch(() => {}); // ignore duplicates if already present
            } catch (strapiLogErr) {
                console.error('⚠️ Failed to sync audit log / order to Strapi:', strapiLogErr.message);
            }

            await client.query('COMMIT');
            return order;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async getOrders() {
        const res = await db.query('SELECT * FROM tx_orders ORDER BY created_at DESC');
        return res.rows;
    }

    async getOrder(orderNumber) {
        const res = await db.query('SELECT * FROM tx_orders WHERE order_number = $1', [orderNumber]);
        return res.rows[0];
    }
}

module.exports = new OrderService();

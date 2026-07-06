const express = require('express');
const router = express.Router();
const db = require('../db/postgresClient');
const axios = require('axios');

const STRAPI_BASE = process.env.STRAPI_API_URL || 'http://localhost:1337';

// -------------------------------------------------------------------
// 1. Submit Review
// -------------------------------------------------------------------
router.post('/reviews', async (req, res, next) => {
    try {
        const { author_name, rating, comment, product_sku } = req.body;

        // Sync to Strapi
        let strapiProductId = null;
        try {
            const prodRes = await axios.get(`${STRAPI_BASE}/api/products?filters[sku][$eq]=${encodeURIComponent(product_sku)}`);
            if (prodRes.data.data && prodRes.data.data.length > 0) {
                const prod = prodRes.data.data[0];
                strapiProductId = prod.documentId || prod.id;
                
                await axios.post(`${STRAPI_BASE}/api/reviews`, {
                    data: {
                        author_name,
                        rating: Number(rating),
                        comment,
                        product: strapiProductId
                    }
                });
            }
        } catch (strapiErr) {
            console.error('⚠️ Failed to sync review to Strapi:', strapiErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully'
        });
    } catch (e) {
        next(e);
    }
});

// -------------------------------------------------------------------
// 2. Newsletter Subscription
// -------------------------------------------------------------------
router.post('/newsletter/subscribe', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        // Insert into Postgres tx_newsletter_subscribers
        try {
            await db.query(
                'INSERT INTO tx_newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
                [email]
            );
        } catch (dbErr) {
            console.error('⚠️ DB Error saving subscriber:', dbErr.message);
        }

        // Sync to Strapi
        try {
            await axios.post(`${STRAPI_BASE}/api/newsletter-subscribers`, {
                data: { email }
            });
        } catch (strapiErr) {
            console.error('⚠️ Failed to sync newsletter subscriber to Strapi:', strapiErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Subscribed to newsletter successfully'
        });
    } catch (e) {
        next(e);
    }
});

// -------------------------------------------------------------------
// 3. Contact Form Submission
// -------------------------------------------------------------------
router.post('/contact', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
        }

        // Insert into Postgres tx_contact_submissions
        try {
            await db.query(
                'INSERT INTO tx_contact_submissions (name, email, subject, message) VALUES ($1, $2, $3, $4)',
                [name, email, subject, message]
            );
        } catch (dbErr) {
            console.error('⚠️ DB Error saving contact submission:', dbErr.message);
        }

        // Sync to Strapi
        try {
            await axios.post(`${STRAPI_BASE}/api/contact-submissions`, {
                data: {
                    name,
                    email,
                    subject,
                    message,
                    resolved: false
                }
            });
        } catch (strapiErr) {
            console.error('⚠️ Failed to sync contact submission to Strapi:', strapiErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully'
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const axios = require('axios');

const STRAPI_BASE = process.env.STRAPI_API_URL || 'http://localhost:1337';

/**
 * GET /api/v1/announcements
 * Retrieve all announcements from Strapi
 */
router.get('/', async (req, res, next) => {
    try {
        const response = await axios.get(`${STRAPI_BASE}/api/announcements?sort=createdAt:desc&pagination[limit]=100`);
        const data = response.data?.data || [];
        
        const formatted = data.map(item => ({
            id: item.id,
            documentId: item.documentId || String(item.id),
            text: item.text,
            type: item.type || 'info',
            is_active: item.is_active !== false,
            createdAt: item.createdAt,
            publishedAt: item.publishedAt
        }));

        res.status(200).json({
            success: true,
            data: formatted,
            total: formatted.length
        });
    } catch (e) {
        console.error('⚠️ Failed to fetch announcements from Strapi:', e.message);
        res.status(200).json({ success: false, data: [], error: e.message });
    }
});

/**
 * POST /api/v1/announcements
 * Create and publish a new announcement in Strapi
 */
router.post('/', async (req, res, next) => {
    try {
        const { text, type = 'info', is_active = true } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, error: 'Announcement text is required' });
        }

        const payload = {
            data: {
                text: text.trim(),
                type: ['info', 'promo', 'critical'].includes(type) ? type : 'info',
                is_active: Boolean(is_active)
            }
        };

        const response = await axios.post(`${STRAPI_BASE}/api/announcements`, payload);
        const created = response.data?.data;

        res.status(201).json({
            success: true,
            data: {
                id: created?.id,
                documentId: created?.documentId || String(created?.id),
                text: created?.text,
                type: created?.type,
                is_active: created?.is_active
            },
            message: 'Announcement created successfully'
        });
    } catch (e) {
        console.error('⚠️ Failed to create announcement in Strapi:', e.response?.data || e.message);
        res.status(500).json({
            success: false,
            error: e.response?.data?.error?.message || e.message
        });
    }
});

/**
 * PUT /api/v1/announcements/:documentId
 * Update an existing announcement in Strapi
 */
router.put('/:documentId', async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const { text, type, is_active } = req.body;

        const updateData = {};
        if (text !== undefined) updateData.text = text.trim();
        if (type !== undefined && ['info', 'promo', 'critical'].includes(type)) updateData.type = type;
        if (is_active !== undefined) updateData.is_active = Boolean(is_active);

        const response = await axios.put(`${STRAPI_BASE}/api/announcements/${documentId}`, {
            data: updateData
        });

        const updated = response.data?.data;

        res.status(200).json({
            success: true,
            data: updated,
            message: 'Announcement updated successfully'
        });
    } catch (e) {
        console.error(`⚠️ Failed to update announcement ${req.params.documentId}:`, e.response?.data || e.message);
        res.status(500).json({
            success: false,
            error: e.response?.data?.error?.message || e.message
        });
    }
});

/**
 * DELETE /api/v1/announcements/:documentId
 * Delete an announcement from Strapi
 */
router.delete('/:documentId', async (req, res, next) => {
    try {
        const { documentId } = req.params;
        await axios.delete(`${STRAPI_BASE}/api/announcements/${documentId}`);

        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (e) {
        console.error(`⚠️ Failed to delete announcement ${req.params.documentId}:`, e.response?.data || e.message);
        res.status(500).json({
            success: false,
            error: e.response?.data?.error?.message || e.message
        });
    }
});

module.exports = router;

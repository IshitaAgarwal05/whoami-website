const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

/**
 * @openapi
 * /analytics/track:
 *   post:
 *     summary: Track a page view and extract visitor IP and country
 *     tags:
 *       - Analytics
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *               referrer:
 *                 type: string
 *               device:
 *                 type: string
 *               ip:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visit recorded successfully
 */
router.post('/analytics/track', async (req, res, next) => {
    try {
        const clientIp = req.body.ip || analyticsService.extractClientIp(req);
        const userAgent = req.headers['user-agent'] || req.body.userAgent || '';
        const device = req.body.device || analyticsService.detectDevice(userAgent);
        const path = req.body.path || '/';
        const referrer = req.body.referrer || req.headers['referer'] || '';

        const record = await analyticsService.recordVisit({
            ip_address: clientIp,
            path,
            user_agent: userAgent,
            device,
            referrer
        });

        res.status(201).json({
            success: true,
            data: {
                id: record.id,
                ip: record.ip_address,
                country_code: record.country_code,
                country_name: record.country_name,
                city: record.city,
                region: record.region
            }
        });
    } catch (e) {
        console.error('⚠️ Analytics tracking error:', e.message);
        // Do not crash client on tracking failure
        res.status(200).json({ success: false, error: e.message });
    }
});

/**
 * @openapi
 * /analytics/stats:
 *   get:
 *     summary: Get visitor analytics, country breakdown, unique IPs, and total visits
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [all, today, 7d, 30d]
 *         description: Time range filter
 *     responses:
 *       200:
 *         description: Analytics statistics
 */
router.get('/analytics/stats', async (req, res, next) => {
    try {
        const timeRange = req.query.timeRange || 'all';
        const stats = await analyticsService.getAnalytics(timeRange);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @openapi
 * /analytics/simulate:
 *   post:
 *     summary: Simulate web requests from different IPs from different countries
 *     tags:
 *       - Analytics
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Traffic simulated successfully
 */
router.post('/analytics/simulate', async (req, res, next) => {
    try {
        const count = Math.min(Math.max(parseInt(req.body.count || 50, 10), 1), 200);
        const result = await analyticsService.simulateTraffic(count);
        res.status(200).json({
            success: true,
            message: `Simulated ${result.simulatedCount} requests from diverse global IPs`,
            data: result
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @openapi
 * /analytics/reset:
 *   delete:
 *     summary: Clear analytics visits data
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Analytics data cleared
 */
router.delete('/analytics/reset', async (req, res, next) => {
    try {
        const result = await analyticsService.clearAnalytics();
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
});

module.exports = router;

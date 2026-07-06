const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - items
 *               - total_amount
 *               - payment_method
 *               - payment_reference_id
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               total_amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               payment_reference_id:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_sku:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 *       500:
 *         description: Failed to create order
 */
router.post('/', async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json({ success: true, data: order });
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Retrieve all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', async (req, res, next) => {
    try {
        const orders = await orderService.getOrders();
        res.json({ success: true, count: orders.length, data: orders });
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /orders/{orderNumber}:
 *   get:
 *     summary: Retrieve a single order by order number
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Order not found
 */
router.get('/:orderNumber', async (req, res, next) => {
    try {
        const order = await orderService.getOrder(req.params.orderNumber);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (e) {
        next(e);
    }
});

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

// Create order
router.post(
  '/create',
  auth,
  [
    body('items').isArray({ min: 1 }).withMessage('Items are required'),
    body('shippingAddress.name').notEmpty().withMessage('Shipping name is required'),
    body('shippingAddress.email').isEmail().withMessage('Valid shipping email is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required')
  ],
  validate,
  ordersController.createOrder
);

// Get user orders
router.get('/', auth, ordersController.getOrders);

// Admin dashboard statistics
router.get('/admin/stats', adminAuth, ordersController.getAdminStats);
router.get('/admin/recent', adminAuth, ordersController.getRecentOrders);
router.get('/admin/export', adminAuth, ordersController.exportAdminOrdersCsv);

// Get order details
router.get('/:orderId', auth, ordersController.getOrderById);

// Update order status (admin only)
router.put(
  '/:orderId/status',
  adminAuth,
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  ordersController.updateOrderStatus
);

// Cancel order
router.put('/:orderId/cancel', auth, ordersController.cancelOrder);

module.exports = router;
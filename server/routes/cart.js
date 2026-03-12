const express = require('express');
const { body, param } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Get cart
router.get('/', auth, cartController.getCart);

// Add to cart
router.post(
  '/add',
  auth,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  cartController.addToCart
);

// Update cart item
router.put(
  '/update/:itemId',
  auth,
  [
    param('itemId').notEmpty().withMessage('Item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  cartController.updateCartItem
);

// Remove from cart
router.delete(
  '/remove/:itemId',
  auth,
  [param('itemId').notEmpty().withMessage('Item ID is required')],
  validate,
  cartController.removeFromCart
);

// Clear cart
router.delete('/clear', auth, cartController.clearCart);

module.exports = router;
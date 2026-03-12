const express = require('express');
const { body } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const productsController = require('../controllers/productsController');

const router = express.Router();

// Get all products with filters and search
router.get('/', productsController.listProducts);

// Get categories
router.get('/categories/list', productsController.listCategories);

// Get single product
router.get('/:id', productsController.getProductById);

// Create product (admin only)
router.post(
  '/',
  adminAuth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('category').notEmpty().withMessage('Category is required')
  ],
  validate,
  productsController.createProduct
);

// Update product (admin only)
router.put(
  '/:id',
  adminAuth,
  [body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a valid number')],
  validate,
  productsController.updateProduct
);

// Delete product (admin only)
router.delete('/:id', adminAuth, productsController.deleteProduct);

module.exports = router;
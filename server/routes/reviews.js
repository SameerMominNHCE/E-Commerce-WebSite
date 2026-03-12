const express = require('express');
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

// Get product reviews
router.get(
  '/product/:productId',
  [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['recent', 'highest', 'lowest', 'helpful'])
      .withMessage('Invalid sort option')
  ],
  validate,
  reviewsController.getProductReviews
);

// Add review
router.post(
  '/add',
  auth,
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().isString().isLength({ min: 1, max: 120 }),
    body('comment').optional().isString().isLength({ min: 1, max: 2000 }),
    body('images').optional().isArray({ max: 5 }).withMessage('Images must be an array')
  ],
  validate,
  reviewsController.addReview
);

// Mark review as helpful
router.put(
  '/:reviewId/helpful',
  auth,
  [param('reviewId').isMongoId().withMessage('Invalid review ID')],
  validate,
  reviewsController.markHelpful
);

module.exports = router;
const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    let sortOption = {};
    switch (sortBy) {
      case 'highest':
        sortOption = { rating: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1 };
        break;
      case 'helpful':
        sortOption = { helpful: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ productId: req.params.productId });

    // Get rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { productId: mongoose.Types.ObjectId(req.params.productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      ratingBreakdown,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add review
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    // Check if user has purchased this product
    const hasOrdered = await Order.findOne({
      userId: req.userId,
      'items.productId': productId
    });

    const review = new Review({
      productId,
      userId: req.userId,
      rating,
      title,
      comment,
      images,
      verified: !!hasOrdered
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(
      productId,
      {
        rating: Math.round(avgRating * 10) / 10,
        reviews: reviews.length
      }
    );

    await review.populate('userId', 'name profileImage');

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark review as helpful
router.put('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
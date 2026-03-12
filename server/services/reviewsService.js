const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const HttpError = require('../utils/HttpError');

const getSortOption = (sortBy) => {
  switch (sortBy) {
    case 'highest':
      return { rating: -1 };
    case 'lowest':
      return { rating: 1 };
    case 'helpful':
      return { helpful: -1 };
    default:
      return { createdAt: -1 };
  }
};

const getProductReviews = async ({ productId, page = 1, limit = 10, sortBy = 'recent' }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new HttpError(400, 'Invalid product ID');
  }

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const sortOption = getSortOption(sortBy);

  const [reviews, total, ratingBreakdown] = await Promise.all([
    Review.find({ productId })
      .populate('userId', 'name profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit),
    Review.countDocuments({ productId }),
    Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ])
  ]);

  return {
    reviews,
    ratingBreakdown,
    pagination: {
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

const addReview = async ({ userId, productId, rating, title, comment, images }) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  const hasOrdered = await Order.findOne({
    userId,
    'items.productId': productId
  });

  const review = new Review({
    productId,
    userId,
    rating,
    title,
    comment,
    images,
    verified: !!hasOrdered
  });

  await review.save();

  const reviews = await Review.find({ productId });
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avgRating * 10) / 10,
    reviews: reviews.length
  });

  await review.populate('userId', 'name profileImage');
  return review;
};

const markHelpful = async (reviewId) => {
  const review = await Review.findByIdAndUpdate(reviewId, { $inc: { helpful: 1 } }, { new: true });
  if (!review) {
    throw new HttpError(404, 'Review not found');
  }

  return review;
};

module.exports = {
  getProductReviews,
  addReview,
  markHelpful
};

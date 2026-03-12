const reviewsService = require('../services/reviewsService');

const getProductReviews = async (req, res, next) => {
  try {
    const result = await reviewsService.getProductReviews({
      productId: req.params.productId,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  try {
    const review = await reviewsService.addReview({
      userId: req.userId,
      ...req.body
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

const markHelpful = async (req, res, next) => {
  try {
    const review = await reviewsService.markHelpful(req.params.reviewId);
    res.json(review);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProductReviews,
  addReview,
  markHelpful
};

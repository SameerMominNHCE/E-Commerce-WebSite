import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import StarRatings from 'react-star-ratings';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/ReviewSection.css';

const ReviewSection = ({ productId, productRating }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const { isAuthenticated } = useAuth();
  const { token } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews/product/${productId}`);
      setReviews(response.data.reviews);
      setRatingBreakdown(response.data.ratingBreakdown);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }

    try {
      await axios.post(
        '/api/reviews/add',
        { productId, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ rating: 5, title: '', comment: '' });
      setShowForm(false);
      await fetchReviews();
      toast.success('Review added successfully!');
    } catch (err) {
      toast.error('Failed to add review');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await axios.put(
        `/api/reviews/${reviewId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="review-section">
      <h2>Customer Reviews</h2>

      <div className="review-summary">
        <div className="rating-overview">
          <div className="average-rating">
            <span className="rating-number">{productRating}</span>
            <StarRatings
              rating={productRating}
              starRatedColor="#ffc107"
              numberOfStars={5}
              name="rating"
              starDimension="20px"
            />
            <span className="review-count">({reviews.length} reviews)</span>
          </div>

          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingBreakdown.find(r => r._id === stars)?.count || 0;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="rating-bar">
                  <span className="stars">{stars} ★</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isAuthenticated && !showForm && (
          <button className="write-review-btn" onClick={() => setShowForm(true)}>
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <motion.div
          className="review-form"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3>Share Your Experience</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="rating-input">
              <label>Rating</label>
              <StarRatings
                rating={formData.rating}
                starRatedColor="#ffc107"
                numberOfStars={5}
                name="rating"
                starDimension="30px"
                changeRating={(rating) =>
                  setFormData({ ...formData, rating })
                }
              />
            </div>

            <input
              type="text"
              placeholder="Review title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Share your experience with this product..."
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              rows="5"
              required
            ></textarea>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Submit Review
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="reviews-list">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length > 0 ? (
          reviews.map(review => (
            <motion.div
              key={review._id}
              className="review-item"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="review-header">
                <div>
                  <h4>{review.userId?.name}</h4>
                  <div className="review-meta">
                    <StarRatings
                      rating={review.rating}
                      starRatedColor="#ffc107"
                      numberOfStars={5}
                      name="rating"
                      starDimension="16px"
                    />
                    {review.verified && <span className="verified">✓ Verified Purchase</span>}
                  </div>
                </div>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {review.title && <h5>{review.title}</h5>}
              <p>{review.comment}</p>

              <div className="review-actions">
                <button onClick={() => handleMarkHelpful(review._id)}>
                  <FiThumbsUp /> Helpful ({review.helpful})
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
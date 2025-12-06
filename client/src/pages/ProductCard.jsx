import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import StarRatings from 'react-star-ratings';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const [wishlist, setWishlist] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product._id, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product._id}`}>
        <div className="product-image-container">
          <img src={product.images[0]} alt={product.name} />
          {discountPercent > 0 && (
            <div className="discount-badge">{discountPercent}% OFF</div>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <div className="low-stock">Only {product.stock} left</div>
          )}
          {product.stock === 0 && (
            <div className="out-of-stock">Out of Stock</div>
          )}
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="description">{product.description.substring(0, 50)}...</p>

          <div className="product-rating">
            <StarRatings
              rating={product.rating}
              starRatedColor="#ffc107"
              numberOfStars={5}
              name="rating"
              starDimension="16px"
              starSpacing="2px"
            />
            <span className="reviews">({product.reviews})</span>
          </div>

          <div className="product-price">
            <span className="current-price">₹{product.price}</span>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="product-actions">
        <motion.button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiShoppingCart /> Add
        </motion.button>
        <motion.button
          className={`wishlist-btn ${wishlist ? 'active' : ''}`}
          onClick={() => setWishlist(!wishlist)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiHeart fill={wishlist ? 'currentColor' : 'none'} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
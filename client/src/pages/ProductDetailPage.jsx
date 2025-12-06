import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import StarRatings from 'react-star-ratings';
import { FiShoppingCart, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found</div>;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-detail-page">
      <motion.div
        className="product-detail-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="product-images">
          <motion.div
            className="main-image"
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src={product.images[selectedImage]} alt={product.name} />
            {discountPercent > 0 && (
              <span className="discount-badge">{discountPercent}% OFF</span>
            )}
          </motion.div>
          <div className="thumbnail-images">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx}`}
                className={selectedImage === idx ? 'active' : ''}
                onClick={() => setSelectedImage(idx)}
              />
            ))}
          </div>
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>

          <div className="product-rating">
            <StarRatings
              rating={product.rating}
              starRatedColor="#ffc107"
              numberOfStars={5}
              name="rating"
              starDimension="20px"
            />
            <span>({product.reviews} reviews)</span>
          </div>

          <div className="product-pricing">
            <span className="current-price">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="original-price">₹{product.originalPrice}</span>
                <span className="discount">Save {discountPercent}%</span>
              </>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-specs">
            <div className="spec">
              <span className="spec-label">Brand:</span>
              <span>{product.brand || 'N/A'}</span>
            </div>
            <div className="spec">
              <span className="spec-label">Category:</span>
              <span>{product.category}</span>
            </div>
            <div className="spec">
              <span className="spec-label">SKU:</span>
              <span>{product.sku}</span>
            </div>
            <div className="spec">
              <span className="spec-label">Stock:</span>
              <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                max={product.stock}
              />
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
            </div>

            <motion.button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShoppingCart /> Add to Cart
            </motion.button>
          </div>

          <div className="product-badges">
            <div className="badge">
              <FiCheck /> Free Shipping on orders above ₹500
            </div>
            <div className="badge">
              <FiCheck /> 7 days money-back guarantee
            </div>
            <div className="badge">
              <FiCheck /> 1-year warranty included
            </div>
          </div>
        </div>
      </motion.div>

      <ReviewSection productId={product._id} productRating={product.rating} />
    </div>
  );
};

export default ProductDetailPage;
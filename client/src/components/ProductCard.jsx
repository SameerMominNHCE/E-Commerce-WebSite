import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import { motion } from 'framer-motion'
import StarRatings from 'react-star-ratings'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import '../styles/ProductCard.css'

const ProductCard = ({ product }) => {
  const [wishlist, setWishlist] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    try {
      setIsAdding(true)
      await addToCart(product._id, 1)
      toast.success('Added to cart!', {
        position: 'bottom-right',
        autoClose: 2000
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    setWishlist(!wishlist)
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist', {
      position: 'bottom-right',
      autoClose: 1500
    })
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product._id}`} className="product-link">
        <div className="product-image-container">
          <img 
            src={product.images[0] || 'https://via.placeholder.com/300'} 
            alt={product.name}
            loading="lazy"
          />
          
          {discountPercent > 0 && (
            <motion.div 
              className="discount-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {discountPercent}% OFF
            </motion.div>
          )}
          
          {product.stock < 5 && product.stock > 0 && (
            <div className="low-stock">Only {product.stock} left</div>
          )}
          
          {product.stock === 0 && (
            <div className="out-of-stock">Out of Stock</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          
          <p className="product-description">
            {product.description.substring(0, 50)}...
          </p>

          <div className="product-rating">
            <StarRatings
              rating={product.rating || 0}
              starRatedColor="#ffc107"
              numberOfStars={5}
              name="rating"
              starDimension="14px"
              starSpacing="1px"
            />
            <span className="reviews">({product.reviews || 0})</span>
          </div>

          <div className="product-price">
            <span className="current-price">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="product-actions">
        <motion.button
          className={`add-to-cart ${isAdding ? 'loading' : ''}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        >
          <FiShoppingCart /> 
          <span>{isAdding ? 'Adding...' : 'Add'}</span>
        </motion.button>
        
        <motion.button
          className={`wishlist-btn ${wishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Add to wishlist"
        >
          <FiHeart fill={wishlist ? 'currentColor' : 'none'} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProductCard
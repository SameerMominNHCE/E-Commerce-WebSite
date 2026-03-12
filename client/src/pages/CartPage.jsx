import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CartPage.css';

const CartPage = () => {
  const { cart, fetchCart, removeFromCart, updateCartItem, getTotalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Please login to view your cart</h2>
          <Link to="/login">Login</Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItem(itemId, newQuantity);
    }
  };

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="cart-page">
      <Link to="/products" className="back-link">
        <FiArrowLeft /> Continue Shopping
      </Link>

      <div className="cart-container">
        {cart.items.length > 0 ? (
          <>
            <div className="cart-items">
              <h2>Shopping Cart ({cart.items.length})</h2>
              <motion.div
                className="items-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {cart.items.map((item) => (
                  <motion.div
                    key={item._id}
                    className="cart-item"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                  >
                    <img
                      src={item.productId?.images?.[0] || item.image || 'https://via.placeholder.com/150?text=No+Image'}
                      alt={item.productId?.name}
                    />
                    <div className="item-details">
                      <h4>{item.productId?.name}</h4>
                      <p className="item-price">₹{item.productId?.price}</p>
                    </div>
                    <div className="quantity-control">
                      <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item._id, parseInt(e.target.value))
                        }
                      />
                      <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      ₹{(item.productId?.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/products">Continue Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
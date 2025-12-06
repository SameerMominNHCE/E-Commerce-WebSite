import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
    paymentMethod: 'credit_card',
    sameAsBilling: true
  });

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.productId?.price * item.quantity),
    0
  );
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        billingAddress: formData.sameAsBilling
          ? {
              name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country
            }
          : null,
        paymentMethod: formData.paymentMethod
      };

      const response = await axios.post('/api/orders/create', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/order-confirmation/${response.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <motion.div
          className="checkout-form"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2>Checkout</h2>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Shipping Information</legend>
              <div className="form-row">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <input
                type="text"
                name="street"
                placeholder="Street Address"
                required
                value={formData.street}
                onChange={handleInputChange}
              />
              <div className="form-row">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  required
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
              <input
                type="text"
                name="country"
                placeholder="Country"
                required
                value={formData.country}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset>
              <legend>Payment Method</legend>
              <div className="payment-options">
                {['credit_card', 'debit_card', 'upi', 'paypal'].map(method => (
                  <label key={method}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={handleInputChange}
                    />
                    <span>{method.replace('_', ' ').toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <motion.button
              type="submit"
              className="submit-btn"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          className="order-summary"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.items.map(item => (
              <div key={item._id} className="summary-item">
                <img src={item.productId?.images[0]} alt={item.productId?.name} />
                <div>
                  <p>{item.productId?.name}</p>
                  <p className="qty">Qty: {item.quantity}</p>
                </div>
                <p>₹{(item.productId?.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
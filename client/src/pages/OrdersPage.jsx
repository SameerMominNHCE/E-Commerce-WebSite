import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import '../styles/OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { token } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/orders', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await axios.put(
          `/api/orders/${orderId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(orders.map(o => o._id === orderId ? response.data : o));
      } catch (err) {
        alert('Failed to cancel order');
      }
    }
  };

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      <div className="filter-buttons">
        {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map(status => (
          <button
            key={status}
            className={filter === status ? 'active' : ''}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length > 0 ? (
        <motion.div
          className="orders-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {orders.map(order => (
            <motion.div
              key={order._id}
              className="order-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="order-header">
                <div>
                  <h3>{order.orderId}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`status ${order.orderStatus}`}>
                  {order.orderStatus.toUpperCase()}
                </span>
              </div>

              <OrderTracker status={order.orderStatus} history={order.statusHistory} />

              <div className="order-items">
                <h4>Items</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p>{item.name}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div>
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span>Tax:</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                <div>
                  <span>Shipping:</span>
                  <span>₹{order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="total">
                  <span>Total:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-actions">
                <Link to={`/order/${order._id}`}>View Details</Link>
                {(order.orderStatus === 'pending' || order.orderStatus === 'confirmed') && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="no-orders">
          <h2>No orders found</h2>
          <p>Start shopping to place your first order!</p>
          <Link to="/products">Browse Products</Link>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
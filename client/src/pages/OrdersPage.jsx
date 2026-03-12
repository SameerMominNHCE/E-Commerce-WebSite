import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import OrderTracker from '../components/OrderTracker';
import { cancelOrderRequest, getOrdersRequest } from '../features/orders/api/orders.api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reorderingId, setReorderingId] = useState('');
  const { addToCart, fetchCart } = useCart();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getOrdersRequest(params);
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
        const response = await cancelOrderRequest(orderId);
        setOrders(orders.map(o => o._id === orderId ? response.data : o));
      } catch (err) {
        alert('Failed to cancel order');
      }
    }
  };

  const handleReorder = async (order) => {
    try {
      setReorderingId(order._id);
      let successCount = 0;

      for (const item of order.items) {
        try {
          await addToCart(item.productId, item.quantity);
          successCount += 1;
        } catch (err) {
          // Continue so one unavailable item does not block reordering others.
        }
      }

      await fetchCart();

      if (successCount === 0) {
        toast.error('Could not add items to cart from this order.');
      } else if (successCount < order.items.length) {
        toast.warning(`Added ${successCount}/${order.items.length} items to cart.`);
      } else {
        toast.success('All items added to cart.');
      }
    } finally {
      setReorderingId('');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const orderIdMatch = order.orderId?.toLowerCase().includes(query);
    const itemMatch = order.items?.some((item) => item.name?.toLowerCase().includes(query));
    return orderIdMatch || itemMatch;
  });

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      <input
        type="text"
        className="orders-search"
        placeholder="Search by order ID or product name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
      ) : filteredOrders.length > 0 ? (
        <motion.div
          className="orders-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredOrders.map(order => (
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

              <OrderTracker
                status={order.orderStatus}
                history={order.statusHistory}
                trackingNumber={order.trackingNumber}
                estimatedDelivery={order.estimatedDelivery}
              />

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
                <button
                  className="reorder-btn"
                  onClick={() => handleReorder(order)}
                  disabled={reorderingId === order._id}
                >
                  {reorderingId === order._id ? 'Reordering...' : 'Reorder'}
                </button>
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
          <h2>No matching orders found</h2>
          <p>Try changing filters or search text.</p>
          <Link to="/products">Browse Products</Link>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
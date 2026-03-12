import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import OrderTracker from '../components/OrderTracker';
import { getOrderByIdRequest } from '../features/orders/api/orders.api';
import { toast } from 'react-toastify';
import { getTrackingUrl } from '../shared/utils/tracking';
import '../styles/OrderDetailPage.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isConfirmation = location.pathname.startsWith('/order-confirmation/');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const fetchOrder = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await getOrderByIdRequest(id);
      setOrder(response.data);
      setLastUpdatedAt(new Date());
    } catch (err) {
      if (!silent) {
        setOrder(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder(false);
  }, [fetchOrder]);

  useEffect(() => {
    if (order?.orderStatus !== 'shipped') return undefined;

    const intervalId = setInterval(() => {
      fetchOrder(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [order?.orderStatus, fetchOrder]);

  if (loading) {
    return <div className="order-detail-loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="order-detail-error">Order not found.</div>;
  }

  const trackingUrl = getTrackingUrl(order.trackingNumber);

  const copyTracking = async () => {
    if (!order.trackingNumber) {
      toast.info('Tracking number is not available yet');
      return;
    }

    try {
      await navigator.clipboard.writeText(order.trackingNumber);
      toast.success('Tracking number copied');
    } catch (err) {
      toast.error('Failed to copy tracking number');
    }
  };

  const openTracking = () => {
    if (!trackingUrl) {
      toast.info('Tracking link is not available yet');
      return;
    }

    window.open(trackingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="order-detail-page">
      <motion.div
        className="order-detail-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {isConfirmation && (
          <div className="order-success-banner">
            <FiCheckCircle />
            <div>
              <h2>Order Placed Successfully</h2>
              <p>Your order has been received and is being processed.</p>
            </div>
          </div>
        )}

        <div className="order-detail-header">
          <div>
            <h1>Order {order.orderId}</h1>
            <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
            {lastUpdatedAt && (
              <small className="refresh-note">
                Last synced: {lastUpdatedAt.toLocaleTimeString()}
                {order.orderStatus === 'shipped' ? ' (auto-refresh every 30s)' : ''}
              </small>
            )}
          </div>
          <span className={`status-badge ${order.orderStatus}`}>{order.orderStatus}</span>
        </div>

        <OrderTracker
          status={order.orderStatus}
          history={order.statusHistory}
          trackingNumber={order.trackingNumber}
          estimatedDelivery={order.estimatedDelivery}
        />

        <div className="order-section">
          <h3>Items</h3>
          {order.items.map((item, idx) => (
            <div key={`${item.productId}-${idx}`} className="order-line-item">
              <img src={item.image || 'https://via.placeholder.com/150?text=No+Image'} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <small>Qty: {item.quantity}</small>
              </div>
              <strong>Rs {(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div className="order-section totals">
          <div><span>Subtotal</span><span>Rs {order.subtotal?.toFixed(2)}</span></div>
          <div><span>Tax</span><span>Rs {order.tax?.toFixed(2)}</span></div>
          <div><span>Shipping</span><span>Rs {order.shippingCost?.toFixed(2)}</span></div>
          <div className="grand-total"><span>Total</span><span>Rs {order.total?.toFixed(2)}</span></div>
        </div>

        <div className="order-section">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress?.name}</p>
          <p>{order.shippingAddress?.street}</p>
          <p>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
          </p>
          <p>{order.shippingAddress?.country}</p>

          <div className="tracking-row">
            <span>
              <strong>Tracking:</strong> {order.trackingNumber || 'Not generated yet'}
            </span>
            <div className="tracking-actions">
              <button type="button" className="copy-btn" onClick={copyTracking}>
                Copy Tracking
              </button>
              <button type="button" className="copy-btn" onClick={openTracking}>
                Open Tracking
              </button>
            </div>
          </div>
        </div>

        <div className="order-detail-actions">
          <button type="button" className="secondary-btn" onClick={() => window.print()}>
            Print Invoice
          </button>
          <Link to="/orders" className="secondary-btn">Back to Orders</Link>
          <Link to="/products" className="primary-btn">Continue Shopping</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailPage;

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiX, FiTruck } from 'react-icons/fi'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import '../styles/AdminOrders.css'

const AdminOrders = () => {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const statuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = filterStatus !== 'all' ? { status: filterStatus } : {}
      const response = await axios.get('/api/orders', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data.orders)
    } catch (err) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const message = `Order ${newStatus}`
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus, message },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
      setSelectedOrder(null)
    } catch (err) {
      toast.error('Failed to update order status')
    }
  }

  const nextStatuses = (currentStatus) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    }
    return statusFlow[currentStatus] || []
  }

  return (
    <div className="admin-orders">
      {/* Filter Buttons */}
      <div className="orders-filter">
        {statuses.map(status => (
          <motion.button
            key={status.value}
            className={`filter-btn ${filterStatus === status.value ? 'active' : ''}`}
            onClick={() => setFilterStatus(status.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {status.label}
          </motion.button>
        ))}
      </div>

      {/* Orders Table */}
      <motion.div
        className="orders-table-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`status-${order.orderStatus}`}
                  >
                    <td>
                      <span className="order-id">{order.orderId}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <p className="customer-name">{order.shippingAddress?.name}</p>
                        <p className="customer-email">{order.shippingAddress?.email}</p>
                      </div>
                    </td>
                    <td className="amount">
                      ₹{order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <motion.button
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Details
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-orders">
            <p>No orders found</p>
          </div>
        )}
      </motion.div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          nextStatuses={nextStatuses(selectedOrder.orderStatus)}
        />
      )}
    </div>
  )
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: '#f39c12', icon: '⏳' },
    confirmed: { color: '#3498db', icon: '✓' },
    shipped: { color: '#2980b9', icon: '📦' },
    delivered: { color: '#27ae60', icon: '✅' },
    cancelled: { color: '#e74c3c', icon: '✗' }
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className="status-badge" style={{ borderLeftColor: config.color }}>
      <span style={{ color: config.color }}>{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Order Details Modal
const OrderDetailsModal = ({ order, onClose, onUpdateStatus, nextStatuses }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content order-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Order Details - {order.orderId}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="order-details">
          {/* Shipping Information */}
          <section className="detail-section">
            <h3>Shipping Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Name:</span>
                <span className="value">{order.shippingAddress?.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{order.shippingAddress?.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{order.shippingAddress?.phone}</span>
              </div>
              <div className="detail-item full-width">
                <span className="label">Address:</span>
                <span className="value">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city},
                  {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </span>
              </div>
            </div>
          </section>

          {/* Order Items */}
          <section className="detail-section">
            <h3>Order Items</h3>
            <div className="items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="item-row">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-sku">Qty: {item.quantity}</p>
                  </div>
                  <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <section className="detail-section">
            <h3>Order Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Tax:</span>
                <span>₹{order.tax?.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Shipping:</span>
                <span>₹{order.shippingCost?.toFixed(2)}</span>
              </div>
              <div className="summary-item total">
                <span>Total:</span>
                <span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Status Update */}
          <section className="detail-section">
            <h3>Update Status</h3>
            <div className="status-update">
              <span className="current-status">
                Current: <strong>{order.orderStatus.toUpperCase()}</strong>
              </span>
              {nextStatuses.length > 0 ? (
                <div className="status-buttons">
                  {nextStatuses.map(status => (
                    <motion.button
                      key={status}
                      className={`status-btn ${status}`}
                      onClick={() => onUpdateStatus(order._id, status)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {status === 'shipped' && <FiTruck />}
                      {status === 'confirmed' && <FiCheck />}
                      {status === 'cancelled' && <FiX />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <p className="no-actions">No further actions available for this order</p>
              )}
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <motion.button
            className="close-modal-btn"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AdminOrders
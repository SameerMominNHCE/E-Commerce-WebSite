import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiDownload, FiExternalLink, FiX, FiTruck } from 'react-icons/fi'
import {
  exportAdminOrdersCsvRequest,
  getAdminOrders,
  updateAdminOrderStatus
} from '../features/admin/api/admin.api'
import { toast } from 'react-toastify'
import { getTrackingUrl } from '../shared/utils/tracking'
import '../styles/AdminOrders.css'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingSearch, setTrackingSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

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
      const response = await getAdminOrders(params)
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
      const response = await updateAdminOrderStatus(orderId, { status: newStatus, message })
      const updatedOrder = response.data

      setOrders((prev) => prev.map((order) => (order._id === orderId ? updatedOrder : order)))
      setSelectedOrder((prev) => (prev && prev._id === orderId ? updatedOrder : prev))

      if (newStatus === 'shipped' && updatedOrder.trackingNumber) {
        toast.success(`Order shipped. Tracking: ${updatedOrder.trackingNumber}`)
      } else if (newStatus === 'delivered') {
        toast.success('Order marked as delivered')
      } else {
        toast.success(`Order status updated to ${newStatus}`)
      }

      if (newStatus !== 'shipped') {
        fetchOrders()
      }
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

  const copyTracking = async (trackingNumber) => {
    if (!trackingNumber) {
      toast.info('Tracking number is not available yet')
      return
    }

    try {
      await navigator.clipboard.writeText(trackingNumber)
      toast.success('Tracking number copied')
    } catch (err) {
      toast.error('Failed to copy tracking number')
    }
  }

  const openTracking = (trackingNumber) => {
    const trackingUrl = getTrackingUrl(trackingNumber)
    if (!trackingUrl) {
      toast.info('Tracking link is not available yet')
      return
    }

    window.open(trackingUrl, '_blank', 'noopener,noreferrer')
  }

  const normalizedSearch = trackingSearch.trim().toLowerCase()
  const displayedOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt)
    const fromPass = fromDate ? createdAt >= new Date(fromDate) : true
    const toPass = toDate
      ? createdAt <= new Date(new Date(toDate).setHours(23, 59, 59, 999))
      : true

    if (!fromPass || !toPass) return false
    if (!normalizedSearch) return true

    return (
      order.orderId?.toLowerCase().includes(normalizedSearch) ||
      order.trackingNumber?.toLowerCase().includes(normalizedSearch) ||
      order.shippingAddress?.name?.toLowerCase().includes(normalizedSearch)
    )
  })

  const exportOrdersCsv = async () => {
    if (!orders.length) {
      toast.info('No orders available to export')
      return
    }

    try {
      const params = {
        status: filterStatus,
        search: trackingSearch.trim(),
        from: fromDate,
        to: toDate
      }

      const response = await exportAdminOrdersCsvRequest(params)
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Orders exported to CSV')
    } catch (err) {
      toast.error('Failed to export CSV')
    }
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

        <input
          type="text"
          className="tracking-search"
          placeholder="Search by order ID, tracking, customer"
          value={trackingSearch}
          onChange={(e) => setTrackingSearch(e.target.value)}
        />

        <input
          type="date"
          className="date-filter"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="date-filter"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <button type="button" className="export-btn" onClick={exportOrdersCsv}>
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Orders Table */}
      <motion.div
        className="orders-table-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : displayedOrders.length > 0 ? (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
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
                        <p className="customer-name">
                          {order.shippingAddress?.name || order.userId?.name || 'Customer'}
                        </p>
                        <p className="customer-email">
                          {order.shippingAddress?.email || order.userId?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="amount">
                      ₹{order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="tracking-col">
                      {order.trackingNumber ? (
                        <div className="tracking-with-copy">
                          <span className="tracking-chip">{order.trackingNumber}</span>
                          <button
                            type="button"
                            className="copy-tracking-btn"
                            onClick={() => copyTracking(order.trackingNumber)}
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            className="copy-tracking-btn"
                            onClick={() => openTracking(order.trackingNumber)}
                          >
                            <FiExternalLink />
                          </button>
                        </div>
                      ) : (
                        <span className="tracking-empty">-</span>
                      )}
                    </td>
                    <td className="date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="order-actions-inline">
                        {order.orderStatus === 'confirmed' && (
                          <motion.button
                            className="ship-btn"
                            onClick={() => handleUpdateStatus(order._id, 'shipped')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiTruck /> Mark Shipped
                          </motion.button>
                        )}

                        {order.orderStatus === 'shipped' && (
                          <motion.button
                            className="deliver-btn"
                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiCheck /> Mark Delivered
                          </motion.button>
                        )}

                        <motion.button
                          className="view-btn"
                          onClick={() => setSelectedOrder(order)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-orders">
            <p>No orders found for this filter/search</p>
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
          onCopyTracking={copyTracking}
          onOpenTracking={openTracking}
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
const OrderDetailsModal = ({
  order,
  onClose,
  onUpdateStatus,
  nextStatuses,
  onCopyTracking,
  onOpenTracking
}) => {
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
                  <img
                    src={item.image || 'https://via.placeholder.com/150?text=No+Image'}
                    alt={item.name}
                  />
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

            <div className="tracking-block">
              <span className="label">Tracking Number:</span>
              <span className="value">
                {order.trackingNumber || 'Not generated yet (set status to shipped)'}
              </span>

              {order.trackingNumber && (
                  <div className="tracking-modal-actions">
                    <button
                      type="button"
                      className="copy-tracking-btn"
                      onClick={() => onCopyTracking(order.trackingNumber)}
                    >
                      Copy Tracking
                    </button>
                    <button
                      type="button"
                      className="copy-tracking-btn"
                      onClick={() => onOpenTracking(order.trackingNumber)}
                    >
                      Open Tracking
                    </button>
                  </div>
              )}
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
import { FiCheck, FiPackage, FiTruck, FiHome } from 'react-icons/fi'
import { motion } from 'framer-motion'
import '../styles/OrderTracker.css'

const OrderTracker = ({ status, history, trackingNumber, estimatedDelivery }) => {
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered']
  const currentStatusIndex = statuses.indexOf(status)

  const statusIcons = {
    pending: <FiPackage />,
    confirmed: <FiCheck />,
    shipped: <FiTruck />,
    delivered: <FiHome />
  }

  const statusLabels = {
    pending: 'Order Placed',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered'
  }

  return (
    <div className="order-tracker">
      {(trackingNumber || estimatedDelivery) && (
        <div className="shipment-meta">
          {trackingNumber && <p><strong>Tracking:</strong> {trackingNumber}</p>}
          {estimatedDelivery && (
            <p>
              <strong>Estimated Delivery:</strong> {new Date(estimatedDelivery).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div className="tracker-steps">
        {statuses.map((s, idx) => (
          <motion.div
            key={s}
            className="tracker-step-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div
              className={`tracker-step ${
                idx <= currentStatusIndex ? 'completed' : 'pending'
              } ${s === status ? 'current' : ''}`}
            >
              <div className="step-icon">
                {idx < currentStatusIndex ? <FiCheck /> : statusIcons[s]}
              </div>
            </div>

            {idx < statuses.length - 1 && (
              <div
                className={`tracker-line ${
                  idx < currentStatusIndex ? 'completed' : 'pending'
                }`}
              ></div>
            )}

            <div className="step-label">
              <span className="step-name">{statusLabels[s]}</span>
              {idx <= currentStatusIndex && (
                <motion.span
                  className="step-time"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {history && history.length > 0
                    ? new Date(history[idx]?.timestamp).toLocaleDateString()
                    : ''}
                </motion.span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {history && history.length > 0 && (
        <motion.div
          className="tracker-timeline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Order History</h3>
          <div className="timeline-events">
            {history.map((event, idx) => (
              <motion.div
                key={idx}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <p className="timeline-status">
                      {event.status.toUpperCase()}
                    </p>
                    <p className="timeline-time">
                      {new Date(event.timestamp).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {event.message && (
                    <p className="timeline-message">{event.message}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default OrderTracker
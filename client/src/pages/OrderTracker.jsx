import React from 'react';
import { FiCheck } from 'react-icons/fi';
import '../styles/OrderTracker.css';

const OrderTracker = ({ status, history }) => {
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(status);

  return (
    <div className="order-tracker">
      <div className="tracker-line">
        {statuses.map((s, idx) => (
          <React.Fragment key={s}>
            <div
              className={`tracker-step ${
                idx <= currentStatusIndex ? 'completed' : ''
              } ${s === status ? 'current' : ''}`}
            >
              {idx < currentStatusIndex ? <FiCheck /> : <span>{idx + 1}</span>}
            </div>
            {idx < statuses.length - 1 && (
              <div
                className={`tracker-connector ${
                  idx < currentStatusIndex ? 'completed' : ''
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="tracker-labels">
        {statuses.map((s) => (
          <span key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
        ))}
      </div>
      {history && history.length > 0 && (
        <div className="tracker-timeline">
          {history.map((event, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot"></div>
              <div>
                <p className="timeline-status">
                  {event.status.toUpperCase()}
                </p>
                <p className="timeline-message">{event.message}</p>
                <p className="timeline-time">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
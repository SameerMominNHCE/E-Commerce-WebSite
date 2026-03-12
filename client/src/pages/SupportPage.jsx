import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import {
  createSupportTicketRequest,
  sendContactMessageRequest
} from '../features/support/api/support.api'
import '../styles/SupportPage.css'

const SupportPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('contact')
  const [loading, setLoading] = useState(false)
  
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  })

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    type: 'general',
    orderId: ''
  })

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await sendContactMessageRequest(contactForm)
      toast.success('Message sent successfully! We will get back to you soon.')
      setContactForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
      })
    } catch (err) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTicketSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a support ticket')
      return
    }

    setLoading(true)

    try {
      const response = await createSupportTicketRequest(ticketForm)
      toast.success(`Ticket created! Ticket ID: ${response.data.ticketId}`)
      setTicketForm({
        subject: '',
        message: '',
        type: 'general',
        orderId: ''
      })
    } catch (err) {
      toast.error('Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const faqItems = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by visiting the "My Orders" section in your account. Your order will display the current status and estimated delivery date.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day money-back guarantee for all products. If you\'re not satisfied, simply contact our support team for a hassle-free return.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 3-5 business days depending on your location. Express delivery options are available during checkout.'
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within 1 hour of placing it. After that, the order goes into processing and cannot be cancelled.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. You\'ll receive an email with instructions to reset your password.'
    },
    {
      question: 'Are my payment details secure?',
      answer: 'Yes! We use industry-standard encryption and secure payment gateways. Your payment information is never stored on our servers.'
    }
  ]

  return (
    <div className="support-page">
      {/* Header */}
      <motion.section
        className="support-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Customer Support</h1>
        <p>We're here to help! Get answers to your questions</p>
      </motion.section>

      {/* Contact Info Cards */}
      <section className="contact-info-cards">
        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FiMail className="card-icon" />
          <h3>Email</h3>
          <p>support@localstore.com</p>
          <small>Response time: 2-4 hours</small>
        </motion.div>

        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FiPhone className="card-icon" />
          <h3>Phone</h3>
          <p>+1 (555) 123-4567</p>
          <small>Mon-Fri: 9AM - 6PM EST</small>
        </motion.div>

        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FiMapPin className="card-icon" />
          <h3>Address</h3>
          <p>123 Main Street, New York, NY 10001</p>
          <small>Headquarters</small>
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="support-tabs">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Us
          </button>
          {isAuthenticated && (
            <button
              className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
              onClick={() => setActiveTab('ticket')}
            >
              Support Ticket
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
        </div>

        {/* Contact Form Tab */}
        {activeTab === 'contact' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={handleContactSubmit} className="support-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  placeholder="What is this about?"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  required
                  rows="6"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSend /> {loading ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Support Ticket Tab */}
        {activeTab === 'ticket' && isAuthenticated && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={handleTicketSubmit} className="support-form">
              <div className="form-group">
                <label>Ticket Type</label>
                <select
                  value={ticketForm.type}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, type: e.target.value })
                  }
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Issue</option>
                  <option value="product">Product Quality</option>
                  <option value="delivery">Delivery Issue</option>
                  <option value="refund">Refund Request</option>
                </select>
              </div>

              <div className="form-group">
                <label>Order ID (Optional)</label>
                <input
                  type="text"
                  value={ticketForm.orderId}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, orderId: e.target.value })
                  }
                  placeholder="If related to an order"
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  required
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, subject: e.target.value })
                  }
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  rows="6"
                  value={ticketForm.message}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, message: e.target.value })
                  }
                  placeholder="Please provide detailed information about your issue"
                ></textarea>
              </div>

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSend /> {loading ? 'Creating Ticket...' : 'Create Support Ticket'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="faq-container">
              {faqItems.map((item, idx) => (
                <FAQItem key={idx} question={item.question} answer={item.answer} />
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* Live Chat Banner */}
      <motion.section
        className="live-chat-banner"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <FiAlertCircle />
        <div>
          <h3>Need Immediate Help?</h3>
          <p>Our support team is available 24/7 to assist you</p>
        </div>
        <button className="chat-btn">Start Live Chat</button>
      </motion.section>
    </div>
  )
}

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className={`faq-item ${isOpen ? 'open' : ''}`}
      initial={false}
    >
      <motion.button
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
        initial={false}
      >
        <span>{question}</span>
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" />
        </motion.svg>
      </motion.button>

      <motion.div
        className="faq-answer"
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <p>{answer}</p>
      </motion.div>
    </motion.div>
  )
}

export default SupportPage
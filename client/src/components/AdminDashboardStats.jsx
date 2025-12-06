import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPackage, FiShoppingCart, FiUsers, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import '../styles/AdminDashboardStats.css'

const AdminDashboardStats = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStockProducts: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('/api/products?limit=1000'),
        axios.get('/api/orders?limit=1000', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const products = productsRes.data.products || []
      const orders = ordersRes.data.orders || []

      const lowStock = products.filter(p => p.stock < 10).length
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        lowStockProducts: lowStock,
        totalRevenue: totalRevenue
      })
    } catch (err) {
      toast.error('Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      icon: FiPackage,
      title: 'Total Products',
      value: stats.totalProducts,
      color: '#3498db',
      bgColor: 'rgba(52, 152, 219, 0.1)'
    },
    {
      icon: FiShoppingCart,
      title: 'Total Orders',
      value: stats.totalOrders,
      color: '#2ecc71',
      bgColor: 'rgba(46, 204, 113, 0.1)'
    },
    {
      icon: FiAlertTriangle,
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      color: '#f39c12',
      bgColor: 'rgba(243, 156, 18, 0.1)'
    },
    {
      icon: FiTrendingUp,
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      color: '#e74c3c',
      bgColor: 'rgba(231, 76, 60, 0.1)'
    }
  ]

  return (
    <div className="admin-stats">
      {loading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            {statCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={idx}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    background: card.bgColor,
                    borderLeftColor: card.color
                  }}
                >
                  <div className="stat-icon" style={{ color: card.color }}>
                    <Icon size={32} />
                  </div>
                  <div className="stat-content">
                    <p className="stat-title">{card.title}</p>
                    <p className="stat-value">{card.value}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Recent Activity */}
          <motion.div
            className="recent-activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Dashboard Summary</h3>
            <div className="activity-list">
              <div className="activity-item">
                <span>📦 Products</span>
                <span>{stats.totalProducts} total products in catalog</span>
              </div>
              <div className="activity-item">
                <span>🛒 Orders</span>
                <span>{stats.totalOrders} orders processed</span>
              </div>
              <div className="activity-item warning">
                <span>⚠️ Inventory Alert</span>
                <span>{stats.lowStockProducts} products with low stock</span>
              </div>
              <div className="activity-item">
                <span>💰 Revenue</span>
                <span>₹{stats.totalRevenue.toFixed(2)} total revenue</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default AdminDashboardStats
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';
import AdminDashboardStats from '../components/AdminDashboardStats';
import '../../../styles/AdminDashboard.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access Denied: Admin only');
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
      toast.success('Logged out successfully!');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiTrendingUp },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'orders', label: 'Orders', icon: FiShoppingCart }
  ];

  return (
    <div className="admin-dashboard">
      <motion.aside
        className="admin-sidebar"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-footer">
          <div className="admin-user">
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </motion.aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{tabs.find((t) => t.id === activeTab)?.label}</h1>
          <div className="header-info">
            <span className="admin-badge">Admin</span>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && <AdminDashboardStats />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'orders' && <AdminOrders />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiSearch } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import '../styles/Navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const { getTotalItems } = useCart()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`)
      setSearchQuery('')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏪 LocalStore
        </Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <FiSearch />
          </button>
        </form>

        {/* Menu Links */}
        <div className="navbar-menu">
          <Link to="/products" className="nav-link">
            Products
          </Link>

          <Link to="/cart" className="nav-link cart-link">
            <FiShoppingCart />
            <span className="cart-count">{getTotalItems()}</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" className="nav-link">
                Orders
              </Link>

              {/* SHOW ADMIN */}
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link">
                  🔧 Admin
                </Link>
              )}

              <div className="user-menu">
                <button className="user-btn">
                  <FiUser /> {user?.name.split(' ')[0]}
                </button>
                <div className="dropdown">
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">My Orders</Link>

                  {/* SHOW ADMIN IN DROPDOWN */}
                  {user?.role === 'admin' && (
                    <Link to="/admin">Admin Dashboard</Link>
                  )}

                  <button onClick={logout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
        >
          <Link to="/products" onClick={() => setIsOpen(false)}>
            Products
          </Link>

          <Link to="/cart" onClick={() => setIsOpen(false)}>
            Cart
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" onClick={() => setIsOpen(false)}>
                Orders
              </Link>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                Profile
              </Link>

              {/* ADMIN MOBILE */}
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  Admin Dashboard
                </Link>
              )}

              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar

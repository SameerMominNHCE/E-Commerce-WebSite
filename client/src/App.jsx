import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider, useCart } from './context/CartContext'

import Navbar from './components/Navbar'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProfilePage from './pages/ProfilePage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import SupportPage from './pages/SupportPage'
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage'

import './App.css'


// ==========================
// Protected Route Component
// ==========================
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  return isAuthenticated ? children : <Navigate to="/login" />
}

// ==========================
// Admin Route Component
// ==========================
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/" />
  return children
}

// ==========================
// App Content (Inside Providers)
// ==========================
const AppContent = () => {
  const { fetchCart } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<ProductsPage />} />

        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Protected Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        {/* Public Pages */}
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Catch all -> redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="bottom-right" />
    </>
  )
}


// ==========================
// Main App Wrapper
// ==========================
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

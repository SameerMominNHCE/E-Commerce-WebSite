import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data)
    } catch (err) {
      console.error('Error fetching cart:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const addToCart = async (productId, quantity = 1) => {
    if (!token) return
    try {
      const response = await axios.post(
        '/api/cart/add',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCart(response.data)
      return true
    } catch (err) {
      throw err
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    if (!token) return
    try {
      const response = await axios.put(
        `/api/cart/update/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCart(response.data)
    } catch (err) {
      throw err
    }
  }

  const removeFromCart = async (itemId) => {
    if (!token) return
    try {
      const response = await axios.delete(`/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data)
    } catch (err) {
      throw err
    }
  }

  const clearCart = async () => {
    if (!token) return
    try {
      await axios.delete('/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart({ items: [] })
    } catch (err) {
      throw err
    }
  }

  const getTotalItems = () => {
    return cart.items.length
  }

  const getTotalPrice = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.productId?.price || item.price) * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
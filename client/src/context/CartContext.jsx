import React, { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  addToCartRequest,
  clearCartRequest,
  fetchCartRequest,
  removeCartItemRequest,
  updateCartItemRequest
} from '../features/cart/api/cart.api'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await fetchCartRequest()
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
      const response = await addToCartRequest({ productId, quantity })
      setCart(response.data)
      return true
    } catch (err) {
      throw err
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    if (!token) return
    try {
      const response = await updateCartItemRequest(itemId, { quantity })
      setCart(response.data)
    } catch (err) {
      throw err
    }
  }

  const removeFromCart = async (itemId) => {
    if (!token) return
    try {
      const response = await removeCartItemRequest(itemId)
      setCart(response.data)
    } catch (err) {
      throw err
    }
  }

  const clearCart = async () => {
    if (!token) return
    try {
      await clearCartRequest()
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
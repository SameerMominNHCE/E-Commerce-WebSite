import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  getMeRequest,
  loginRequest,
  registerRequest,
  updateProfileRequest
} from '../features/auth/api/auth.api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await getMeRequest()
      setUser(response.data)
    } catch (err) {
      setToken(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await loginRequest({ email, password })
      const { token, user } = response.data
      setToken(token)
      setUser(user)
      localStorage.setItem('token', token)
      return true
    } catch (err) {
      throw err
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await registerRequest({ 
        name, 
        email, 
        password 
      })
      const { token, user } = response.data
      setToken(token)
      setUser(user)
      localStorage.setItem('token', token)
      return true
    } catch (err) {
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const updateProfile = async (updates) => {
    try {
      const response = await updateProfileRequest(updates)
      setUser(response.data)
      return true
    } catch (err) {
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
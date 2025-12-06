import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEdit2, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import '../styles/ProfilePage.css'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/')
      toast.success('Logged out successfully!')
    }
  }

  return (
    <div className="profile-page">
      <motion.div
        className="profile-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <div className="profile-avatar">
            <img
              src={user?.profileImage || 'https://via.placeholder.com/150'}
              alt={user?.name}
            />
          </div>
          <div className="profile-info-header">
            <h1>{user?.name}</h1>
            <p className="member-since">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="profile-actions">
            {!isEditing && (
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit2 /> Edit Profile
              </button>
            )}
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {isEditing ? (
          <motion.form
            className="profile-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="form-section">
              <h2>Personal Information</h2>
              
              <div className="form-group">
                <label>
                  <FiUser /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FiMail /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>
                  <FiPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Address Information</h2>

              <div className="form-group">
                <label>
                  <FiMapPin /> Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <motion.button
                type="submit"
                className="save-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
              <motion.button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiX /> Cancel
              </motion.button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            className="profile-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="info-section">
              <h2>Personal Information</h2>
              <div className="info-group">
                <span className="info-label">
                  <FiUser /> Full Name
                </span>
                <span className="info-value">{user?.name}</span>
              </div>

              <div className="info-group">
                <span className="info-label">
                  <FiMail /> Email
                </span>
                <span className="info-value">{user?.email}</span>
              </div>

              <div className="info-group">
                <span className="info-label">
                  <FiPhone /> Phone Number
                </span>
                <span className="info-value">{user?.phone || 'Not provided'}</span>
              </div>
            </div>

            {user?.address && (
              <div className="info-section">
                <h2>Address Information</h2>
                <div className="info-group">
                  <span className="info-label">
                    <FiMapPin /> Address
                  </span>
                  <span className="info-value">
                    {user.address.street && `${user.address.street}, `}
                    {user.address.city && `${user.address.city}, `}
                    {user.address.state && `${user.address.state} `}
                    {user.address.zipCode}
                  </span>
                </div>
                <div className="info-group">
                  <span className="info-label">Country</span>
                  <span className="info-value">{user.address.country || 'Not provided'}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default ProfilePage
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../features/admin/api/admin.api'
import { toast } from 'react-toastify'
import '../styles/AdminProducts.css'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Electronics',
    stock: '',
    brand: '',
    sku: '',
    discount: '',
    images: []
  })

  const categories = ['Electronics', 'Clothing', 'Food', 'Home', 'Books', 'Sports', 'Toys', 'Beauty']

  useEffect(() => {
    fetchProducts()
  }, [page, searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await getAdminProducts({
        search: searchTerm,
        page,
        limit: 10
      })
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (err) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'Electronics',
      stock: '',
      brand: '',
      sku: '',
      discount: '',
      images: []
    })
    setShowForm(true)
  }

  const handleEditProduct = (product) => {
    setEditingId(product._id)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      stock: product.stock,
      brand: product.brand || '',
      sku: product.sku || '',
      discount: product.discount || '',
      images: product.images || []
    })
    setShowForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'discount' ? parseFloat(value) : value
    }))
  }

  const handleImageUrlAdd = (e) => {
    const url = e.target.value
    if (url && e.key === 'Enter') {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }))
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      if (editingId) {
        await updateProduct(editingId, formData)
        toast.success('Product updated successfully!')
      } else {
        await createProduct(formData)
        toast.success('Product created successfully!')
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        toast.success('Product deleted successfully!')
        fetchProducts()
      } catch (err) {
        toast.error('Failed to delete product')
      }
    }
  }

  return (
    <div className="admin-products">
      {/* Search and Add Button */}
      <div className="products-toolbar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <motion.button
          className="add-product-btn"
          onClick={handleAddProduct}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus /> Add Product
        </motion.button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          formData={formData}
          categories={categories}
          editingId={editingId}
          onInputChange={handleInputChange}
          onImageUrlAdd={handleImageUrlAdd}
          onRemoveImage={handleRemoveImage}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Products Table */}
      <motion.div
        className="products-table-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={product.stock < 10 ? 'low-stock' : ''}
                    >
                      <td>
                        <div className="product-cell">
                          <img src={product.images[0]} alt={product.name} />
                          <div>
                            <p className="product-name">{product.name}</p>
                            <p className="product-sku">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="price-cell">
                        <span className="current-price">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="original-price">₹{product.originalPrice}</span>
                        )}
                      </td>
                      <td>
                        <StockBadge stock={product.stock} />
                      </td>
                      <td>
                        <StatusBadge isActive={product.isActive} />
                      </td>
                      <td>
                        <div className="action-buttons">
                          <motion.button
                            className="edit-btn"
                            onClick={() => handleEditProduct(product)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </motion.button>
                          <motion.button
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={page === p ? 'active' : ''}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products">
            <p>No products found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Stock Badge Component
const StockBadge = ({ stock }) => {
  let className = 'stock-badge'
  let text = ''
  let icon = null

  if (stock === 0) {
    className += ' out-of-stock'
    text = 'Out of Stock'
    icon = <FiX />
  } else if (stock < 10) {
    className += ' low-stock'
    text = `${stock} Left`
    icon = <FiAlertTriangle />
  } else if (stock < 50) {
    className += ' medium-stock'
    text = `${stock} in Stock`
  } else {
    className += ' in-stock'
    text = `${stock} in Stock`
    icon = <FiCheck />
  }

  return (
    <span className={className}>
      {icon && icon}
      {text}
    </span>
  )
}

// Status Badge Component
const StatusBadge = ({ isActive }) => {
  return (
    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
      {isActive ? <FiCheck /> : <FiX />}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// Product Form Modal
const ProductFormModal = ({
  formData,
  categories,
  editingId,
  onInputChange,
  onImageUrlAdd,
  onRemoveImage,
  onSubmit,
  onClose
}) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={onSubmit} className="product-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                  placeholder="Enter product description"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={onInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={onInputChange}
                    placeholder="Brand name"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="form-section">
              <h3>Pricing & Inventory</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={onInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={onInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={onInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={onInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={onInputChange}
                  placeholder="e.g., PROD-001"
                />
              </div>
            </div>

            {/* Images */}
            <div className="form-section">
              <h3>Product Images</h3>

              <div className="form-group">
                <label>Add Image URL</label>
                <input
                  type="url"
                  placeholder="Paste image URL and press Enter"
                  onKeyPress={onImageUrlAdd}
                />
                <small>Press Enter to add image URL</small>
              </div>

              {formData.images.length > 0 && (
                <div className="images-list">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="image-item">
                      <img src={img} alt={`Product ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        className="remove-image-btn"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <motion.button
              type="submit"
              className="save-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {editingId ? 'Update Product' : 'Create Product'}
            </motion.button>
            <motion.button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default AdminProducts
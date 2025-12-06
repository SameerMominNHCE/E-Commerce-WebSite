const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    originalPrice: Number,
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Clothing', 'Food', 'Home', 'Books', 'Sports', 'Toys', 'Beauty']
    },
    subCategory: String,
    images: [String],
    stock: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: {
      type: Number,
      default: 0
    },
    tags: [String],
    brand: String,
    sku: String,
    isActive: {
      type: Boolean,
      default: true
    },
    discount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
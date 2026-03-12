const Product = require('../models/Product');
const HttpError = require('../utils/HttpError');

const buildSortOption = (sortBy) => {
  switch (sortBy) {
    case 'price_low':
    case 'priceAsc':
      return { price: 1 };
    case 'price_high':
    case 'priceDesc':
      return { price: -1 };
    case 'rating':
      return { rating: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { rating: -1 };
  }
};

const buildListQuery = ({ search, category, minPrice, maxPrice }) => {
  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  return query;
};

const listProducts = async ({ search, category, minPrice, maxPrice, sortBy, page = 1, limit = 12 }) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const query = buildListQuery({ search, category, minPrice, maxPrice });
  const sortOption = buildSortOption(sortBy);

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(parsedLimit),
    Product.countDocuments(query)
  ]);

  return {
    products,
    pagination: {
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }
  return product;
};

const createProduct = async (payload) => {
  const product = new Product(payload);
  await product.save();
  return product;
};

const updateProduct = async (id, payload) => {
  const product = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }
  return { message: 'Product deleted' };
};

const listCategories = async () => {
  return Product.distinct('category');
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories
};

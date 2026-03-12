const productsService = require('../services/productsService');

const listProducts = async (req, res, next) => {
  try {
    const data = await productsService.listProducts(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productsService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await productsService.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const listCategories = async (req, res, next) => {
  try {
    const categories = await productsService.listCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories
};

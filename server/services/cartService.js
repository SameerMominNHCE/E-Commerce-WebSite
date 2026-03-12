const Cart = require('../models/Cart');
const Product = require('../models/Product');
const HttpError = require('../utils/HttpError');

const NO_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
    await cart.populate('items.productId');
  }
  return cart;
};

const getCart = async (userId) => {
  return getOrCreateCart(userId);
};

const addToCart = async ({ userId, productId, quantity }) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new HttpError(400, 'Insufficient stock');
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItem = cart.items.find((item) => item.productId.toString() === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = product.price;
    existingItem.image = product.images?.[0] || NO_IMAGE;
  } else {
    cart.items.push({
      productId,
      quantity,
      price: product.price,
      image: product.images?.[0] || NO_IMAGE
    });
  }

  await cart.save();
  await cart.populate('items.productId');

  return cart;
};

const updateCartItem = async ({ userId, itemId, quantity }) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new HttpError(404, 'Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new HttpError(404, 'Item not found in cart');
  }

  const product = await Product.findById(item.productId);
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new HttpError(400, 'Insufficient stock');
  }

  item.quantity = quantity;
  item.price = product.price;
  item.image = product.images?.[0] || item.image || NO_IMAGE;

  await cart.save();
  await cart.populate('items.productId');

  return cart;
};

const removeFromCart = async ({ userId, itemId }) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new HttpError(404, 'Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new HttpError(404, 'Item not found in cart');
  }

  item.deleteOne();
  await cart.save();
  await cart.populate('items.productId');

  return cart;
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new HttpError(404, 'Cart not found');
  }

  cart.items = [];
  await cart.save();

  return { message: 'Cart cleared' };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

const cartService = require('../services/cartService');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addToCart({
      userId: req.userId,
      productId: req.body.productId,
      quantity: req.body.quantity
    });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateCartItem({
      userId: req.userId,
      itemId: req.params.itemId,
      quantity: req.body.quantity
    });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart({
      userId: req.userId,
      itemId: req.params.itemId
    });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

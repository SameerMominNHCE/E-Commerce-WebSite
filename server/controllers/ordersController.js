const ordersService = require('../services/ordersService');

const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder({
      userId: req.userId,
      ...req.body
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const result = await ordersService.getOrders({
      userId: req.userId,
      isAdmin: req.user?.role === 'admin',
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById({
      requesterId: req.userId,
      orderId: req.params.orderId,
      isAdmin: req.user?.role === 'admin'
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderStatus({
      orderId: req.params.orderId,
      status: req.body.status,
      message: req.body.message
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await ordersService.cancelOrder({
      userId: req.userId,
      orderId: req.params.orderId
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const stats = await ordersService.getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getRecentOrders(req.query.limit || 5);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

const exportAdminOrdersCsv = async (req, res, next) => {
  try {
    const csv = await ordersService.exportAdminOrdersCsv({
      status: req.query.status,
      search: req.query.search,
      from: req.query.from,
      to: req.query.to
    });

    const fileName = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAdminStats,
  getRecentOrders,
  exportAdminOrdersCsv
};

const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const HttpError = require('../utils/HttpError');

const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const generateTrackingNumber = () => {
  return `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const createOrder = async ({ userId, items, shippingAddress, billingAddress, paymentMethod, notes }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'No items in order');
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new HttpError(404, `Product ${item.productId} not found`);
    }

    if (product.stock < item.quantity) {
      throw new HttpError(400, `Insufficient stock for ${product.name}`);
    }

    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'
    });

    product.stock -= item.quantity;
    await product.save();
  }

  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const shippingCost = 50;
  const total = subtotal + tax + shippingCost;

  const order = new Order({
    orderId: generateOrderId(),
    userId,
    items: orderItems,
    shippingAddress,
    billingAddress,
    paymentMethod,
    subtotal,
    tax,
    shippingCost,
    total,
    estimatedDelivery: addDays(new Date(), 5),
    notes,
    statusHistory: [{ status: 'pending', message: 'Order created successfully' }]
  });

  await order.save();

  await Cart.findOneAndUpdate({ userId }, { items: [] });

  return order;
};

const getOrders = async ({ userId, isAdmin, status, page = 1, limit = 10 }) => {
  const query = isAdmin ? {} : { userId };
  if (status) {
    query.orderStatus = status;
  }

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

const getOrderById = async ({ requesterId, orderId, isAdmin }) => {
  const query = isAdmin ? { _id: orderId } : { _id: orderId, userId: requesterId };
  const order = await Order.findOne(query);

  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  return order;
};

const updateOrderStatus = async ({ orderId, status, message }) => {
  const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new HttpError(400, 'Invalid status value');
  }

  const updatePayload = {
    orderStatus: status,
    $push: {
      statusHistory: {
        status,
        message: message || `Order ${status}`
      }
    }
  };

  if (status === 'shipped') {
    updatePayload.trackingNumber = generateTrackingNumber();
    updatePayload.estimatedDelivery = addDays(new Date(), 3);
  }

  if (status === 'delivered') {
    updatePayload.estimatedDelivery = new Date();
  }

  const order = await Order.findByIdAndUpdate(orderId, updatePayload, { new: true });

  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  return order;
};

const cancelOrder = async ({ userId, orderId }) => {
  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  if (order.orderStatus === 'cancelled') {
    return order;
  }

  if (order.orderStatus !== 'pending' && order.orderStatus !== 'confirmed') {
    throw new HttpError(400, 'Cannot cancel this order');
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', message: 'Order cancelled by user' });
  await order.save();

  return order;
};

const getAdminStats = async () => {
  const [totalProducts, lowStockProducts, totalOrders, revenueData] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: { $lt: 10 } }),
    Order.countDocuments({}),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ])
  ]);

  return {
    totalProducts,
    totalOrders,
    lowStockProducts,
    totalRevenue: revenueData[0]?.totalRevenue || 0
  };
};

const getRecentOrders = async (limit = 5) => {
  const parsedLimit = parseInt(limit, 10);
  return Order.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(parsedLimit);
};

const escapeCsv = (value) => {
  const raw = `${value ?? ''}`;
  return `"${raw.replace(/"/g, '""')}"`;
};

const exportAdminOrdersCsv = async ({ status, search, from, to }) => {
  const query = {};
  if (status && status !== 'all') {
    query.orderStatus = status;
  }

  if (from || to) {
    query.createdAt = {};
    if (from) {
      query.createdAt.$gte = new Date(from);
    }
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const orders = await Order.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const normalized = (search || '').trim().toLowerCase();
  const filtered = normalized
    ? orders.filter((order) => {
        return (
          order.orderId?.toLowerCase().includes(normalized) ||
          order.trackingNumber?.toLowerCase().includes(normalized) ||
          order.shippingAddress?.name?.toLowerCase().includes(normalized)
        );
      })
    : orders;

  const headers = [
    'Order ID',
    'Tracking Number',
    'Customer Name',
    'Customer Email',
    'Status',
    'Total Amount',
    'Date',
    'Item Count'
  ];

  const rows = filtered.map((order) => [
    order.orderId,
    order.trackingNumber || '',
    order.shippingAddress?.name || order.userId?.name || '',
    order.shippingAddress?.email || order.userId?.email || '',
    order.orderStatus,
    order.total?.toFixed(2) || '0.00',
    new Date(order.createdAt).toISOString(),
    order.items?.length || 0
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');
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

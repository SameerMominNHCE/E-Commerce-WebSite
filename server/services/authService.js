const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');

const buildAuthResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});

const signToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: '7d'
  });
};

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new HttpError(400, 'User already exists');
  }

  const user = new User({ name, email, password });
  await user.save();

  const token = signToken(user);
  return buildAuthResponse(user, token);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(400, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new HttpError(400, 'Invalid credentials');
  }

  const token = signToken(user);
  return buildAuthResponse(user, token);
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

const updateProfile = async (userId, updates) => {
  const allowedUpdates = ['name', 'phone', 'address', 'profileImage'];
  const payload = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      payload[key] = updates[key];
    }
  }

  const user = await User.findByIdAndUpdate(userId, payload, { new: true }).select('-password');
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile
};

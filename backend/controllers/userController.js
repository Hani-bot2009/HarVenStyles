// ================================================================
//  HarVenStyles — userController.js
//  Handles: register, login, delete account
// ================================================================
const asyncHandler = require('express-async-handler');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const User         = require('../models/userModel');

/* ── Generate JWT ─────────────────────────────────────────────── */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'harvenstylessecret', { expiresIn: '30d' });

/* ── Auth middleware (used by protected routes) ──────────────── */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'harvenstylessecret');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      res.status(401);
      throw new Error('Not authorized, token invalid');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/* ── REGISTER ────────────────────────────────────────────────── */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt           = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });

  if (user) {
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/* ── LOGIN ───────────────────────────────────────────────────── */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/* ── DELETE ACCOUNT (protected) ─────────────────────────────── */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.deleteOne({ _id: req.user._id });
  res.json({ message: 'Account deleted successfully' });
});

module.exports = { registerUser, loginUser, deleteUser, protect };
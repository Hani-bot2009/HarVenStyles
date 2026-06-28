/* ================================================================
   userRoutes.js — HarVenStyles
   Routes: POST /register · POST /login · DELETE /me
   CommonJS only. No ES Modules.
================================================================ */

const express      = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const User         = require('../models/userModel');

const router = express.Router();

/* ── JWT helper ────────────────────────────────────────────────── */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'harvenstylessecret', {
    expiresIn: '30d',
  });

/* ── Auth middleware (used by DELETE /me only) ─────────────────── */
const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorised — no token');
  }

  try {
    const decoded = jwt.verify(
      auth.split(' ')[1],
      process.env.JWT_SECRET || 'harvenstylessecret'
    );
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorised — invalid token');
  }
});

/* ======================================================
   REGISTER   POST /api/users/register
====================================================== */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user           = await User.create({ name, email, password: hashedPassword });

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
  })
);

/* ======================================================
   LOGIN   POST /api/users/login
====================================================== */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
   
    console.log("LOGIN EMAIL:", email);
    console.log("USER FOUND:", !!user);

    if (user) {
      console.log("STORED HASH:", user.password);
    }

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
  })
);


/* ======================================================
   DELETE ACCOUNT   DELETE /api/users/me
   Protected — requires valid Bearer token.
====================================================== */
router.delete(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  })
);

module.exports = router;
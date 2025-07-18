const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Validation middleware for registration
const validateRegister = (req, res, next) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({
      error: 'Email, password, and username are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters long',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Please provide a valid email address',
    });
  }

  next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
    });
  }

  next();
};

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
    },
  });
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
    },
  });
});

module.exports = router;

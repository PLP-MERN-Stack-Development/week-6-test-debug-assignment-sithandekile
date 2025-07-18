const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register controller
exports.register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ADD THIS
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Use env var in production

// ... (farmerSchema & warehouseSchema - no change)

router.post('/register', async (req, res) => {
  const { email, password, userType, ...rest } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save
    const user = new User({
      email,
      password: hashedPassword,
      userType,
      ...rest
    });
    await user.save();

    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    // Create JWT token and include in response
    const payload = {
      userId: user._id,
      userType: user.userType,
      name: user.name,
      email: user.email
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      userType: user.userType,
      name: user.name,
      token // <-- IMPORTANT!
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

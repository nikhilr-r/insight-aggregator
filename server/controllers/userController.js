const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if all fields are present
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash the password (Security Step!)
    const salt = await bcrypt.genSalt(10); // Generate a "salt" (random data)
    const hashedPassword = await bcrypt.hash(password, salt); // Mix salt with password

    // 4. Create the user in MongoDB
    const user = await User.create({
      username,
      email,
      password: hashedPassword, // Store the HASH, not the plain text
    });

    // 5. If successful, send back the user data and a Token
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // <--- Giving them the "ID Card"
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token is valid for 30 days
  });
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check for user email
    const user = await User.findOne({ email });

    // 2. Check password
    // bcrypt.compare(plainPassword, hashedPassword)
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        preferences: user.preferences,
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... generateToken helper function ...

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  // We have access to req.user because of our middleware!
  res.status(200).json(req.user);
};


// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  // Now expecting 'country' in the body too
  const { preferences, country } = req.body; 

  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.preferences = preferences || user.preferences;
      user.country = country || user.country; // Update country if provided
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        preferences: updatedUser.preferences,
        country: updatedUser.country, // Send it back to frontend
        token: req.headers.authorization.split(' ')[1] // Keep the token valid
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Don't forget to export it:

// UPDATE EXPORTS
module.exports = {
  registerUser,
  loginUser, getMe , updateUserPreferences // <--- Don't forget this!
};
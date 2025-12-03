const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if the "Authorization" header exists and starts with "Bearer"
  // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get the token from the header (remove "Bearer " string)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in DB and attach it to the request object
      // .select('-password') means "don't give me the password hash"
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Move to the next piece of middleware (or the controller)
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
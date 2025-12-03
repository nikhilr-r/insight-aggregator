const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateUserPreferences 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // <--- Import Guard

router.post('/', registerUser);
router.post('/login', loginUser);

// Put the 'protect' middleware BEFORE the 'getMe' controller
router.get('/me', protect, getMe); // <--- Logic: Protect -> GetMe

// Add this line (It must be protected!)
router.put('/preferences', protect, updateUserPreferences);

module.exports = router;
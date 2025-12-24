const express = require('express');
const router = express.Router();
const { summarizeNews } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protect this route so only logged-in users use your API quota
router.post('/summarize', protect, summarizeNews);

module.exports = router;
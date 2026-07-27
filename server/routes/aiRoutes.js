const express = require('express');
const router = express.Router();
const { summarizeNews, getFullStory } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protect this route so only logged-in users use your API quota
router.post('/summarize', protect, summarizeNews);
router.post('/full-story', protect, getFullStory);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getNews } = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');

// This route IS protected. You must be logged in to get news.
router.get('/', protect, getNews);

module.exports = router;
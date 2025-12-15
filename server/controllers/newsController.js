const axios = require('axios');
const User = require('../models/User');
const { Redis } = require('@upstash/redis');

// Initialize Redis (Always initialize, but we might not use it)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const getNews = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = user.preferences;
    const countryCode = user.country || 'in';

    // Check the "Kill Switch"
    const isRedisEnabled = process.env.ENABLE_REDIS === 'true';

    // Generate Cache Key
    const sortedPrefs = preferences.length > 0 ? preferences.sort().join(',') : 'top-headlines';
    const cacheKey = `news:${countryCode}:${sortedPrefs}`;

    // --- SMART LOGIC START ---
    
    // 1. Only Check Redis if Enabled
    if (isRedisEnabled) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`⚡ CACHE HIT: Served ${cacheKey} from Redis`);
          return res.status(200).json(cachedData);
        }
      } catch (redisError) {
        console.error("Redis Error (Ignoring):", redisError.message);
        // If Redis fails, just continue to API (Fail Open)
      }
    } else {
      console.log(`⚠️ CACHE DISABLED: Skipping Redis check for ${cacheKey}`);
    }

    // 2. Fetch from API (The Usual Way)
    console.log(`🐢 FETCHING: Calling NewsAPI...`);
    
    const countryMap = { 'in': 'India', 'us': 'USA', 'gb': 'UK', 'ca': 'Canada', 'au': 'Australia' };
    const countryName = countryMap[countryCode] || 'India';
    
    const date = new Date();
    date.setDate(date.getDate() - 3);
    const fromDate = date.toISOString().split('T')[0];

    let url = '';
    if (preferences.length > 0) {
      const topicQuery = preferences.join(' OR ');
      const finalQuery = `(${topicQuery}) AND ${countryName}`;
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(finalQuery)}&from=${fromDate}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${process.env.NEWS_API_KEY}`;
    }

    const response = await axios.get(url);
    const articles = response.data.articles;

    // 3. Only Save to Redis if Enabled
    if (isRedisEnabled) {
      // Don't await this! Let it happen in the background so user gets data faster.
      redis.set(cacheKey, articles, { ex: 3600 }).catch(err => console.error("Redis Save Error:", err.message));
    }

    res.status(200).json(articles);

  } catch (error) {
    console.error('News Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
};

module.exports = { getNews };
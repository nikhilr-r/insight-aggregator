const axios = require('axios');
const User = require('../models/User');
const { Redis } = require('@upstash/redis');

// 1. DEFENSIVE INITIALIZATION
// Only connect to Redis if the secrets exist in .env
let redis;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn("⚠️ Redis credentials missing in .env. Caching will be DISABLED.");
}

const getNews = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = user.preferences;
    const countryCode = user.country || 'in';

    // 2. CHECK CONFIGURATION
    // Redis is enabled ONLY if the switch is 'true' AND we have a valid client
    const isSwitchOn = process.env.ENABLE_REDIS === 'true';
    const isRedisConfigured = !!redis; // true if redis client exists
    const isRedisEnabled = isSwitchOn && isRedisConfigured;

    // Generate Cache Key
    const sortedPrefs = preferences.length > 0 ? preferences.sort().join(',') : 'top-headlines';
    const cacheKey = `news:${countryCode}:${sortedPrefs}`;

    // --- SMART LOGIC START ---
    
    // 3. Only Check Redis if Enabled & Configured
    if (isRedisEnabled) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`⚡ CACHE HIT: Served ${cacheKey} from Redis`);
          return res.status(200).json(cachedData);
        }
      } catch (redisError) {
        console.error("Redis Read Error (Ignoring):", redisError.message);
      }
    } else {
      if (!isSwitchOn) console.log(`⚠️ CACHE DISABLED: ENABLE_REDIS is set to false`);
      else if (!isRedisConfigured) console.log(`⚠️ CACHE DISABLED: Redis credentials missing`);
    }

    // 4. Fetch from API (The Usual Way)
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

    // 5. Only Save to Redis if Enabled & Configured
    if (isRedisEnabled) {
      // Don't await this! Let it happen in the background.
      redis.set(cacheKey, articles, { ex: 3600 })
           .catch(err => console.error("Redis Save Error:", err.message));
    }

    res.status(200).json(articles);

  } catch (error) {
    console.error('News Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
};

module.exports = { getNews };
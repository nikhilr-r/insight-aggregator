const axios = require('axios');
const User = require('../models/User');

const getNews = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = user.preferences;
    const countryCode = user.country || 'in';

    // Map codes to names for better search accuracy
    const countryMap = { 'in': 'India', 'us': 'USA', 'gb': 'UK', 'ca': 'Canada', 'au': 'Australia' };
    const countryName = countryMap[countryCode] || 'India';

    // Date: Last 3 days only
    const date = new Date();
    date.setDate(date.getDate() - 3);
    const fromDate = date.toISOString().split('T')[0];

    let url = '';

    if (preferences.length > 0) {
      // Logic: (Tech OR Sports) AND India
      const topicQuery = preferences.join(' OR ');
      const finalQuery = `(${topicQuery}) AND ${countryName}`;
      
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(finalQuery)}&from=${fromDate}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;
    } else {
      // If no topics, show Top Headlines for the country
      url = `https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${process.env.NEWS_API_KEY}`;
    }

    const response = await axios.get(url);
    res.status(200).json(response.data.articles);

  } catch (error) {
    console.error('NewsAPI Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
};

module.exports = { getNews };
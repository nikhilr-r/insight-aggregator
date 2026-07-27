// Support both Google Gemini and OpenAI as fallbacks.
// If `GEMINI_API_KEY` is present and the Google library is installed, use Gemini.
// Otherwise, if `OPENAI_API_KEY` is present, use OpenAI's Chat Completions.

// @desc    Summarize text using AI
// @route   POST /api/ai/summarize
// @access  Private
const summarizeNews = async (req, res) => {
  const { text, title } = req.body;

  if (!text && !title) {
    return res.status(400).json({ message: 'No content to summarize' });
  }

  const contentToSummarize = `Title: ${title}\n\nContent: ${text}`;
  const prompt = `Summarize the following news article into 3 concise bullet points. Make it easy to read. \n\n${contentToSummarize}`;

  // Try Gemini (Google) first if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return res.status(200).json({ summary });
    } catch (err) {
      console.error('Gemini error, falling back to OpenAI if available:', err.message || err);
      // fall through to OpenAI path
    }
  }

  // Fallback to OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const resp = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      });

      const summary = resp.choices?.[0]?.message?.content || resp.choices?.[0]?.text || '';
      return res.status(200).json({ summary });
    } catch (err) {
      console.error('OpenAI error:', err.message || err);
      return res.status(500).json({ message: 'AI summarization failed (OpenAI)' });
    }
  }

  // If neither key available, provide a lightweight extractive summarizer fallback
  console.warn('No AI provider configured. Using improved local extractive summarizer.');
  try {
    const plain = (text || title || contentToSummarize).replace(/\s+/g, ' ').trim();

    // Split into sentences (basic heuristic)
    const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean).map(s => s.trim());
    if (sentences.length === 0) {
      return res.status(200).json({ summary: '- No content available.' });
    }

    // Build simple term-frequency map excluding stopwords
    const stopwords = new Set(['the','is','in','and','to','of','a','an','for','on','with','that','this','it','as','by','from','at','be','are','was','will','which','or']);
    const words = plain.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const tf = Object.create(null);
    for (const w of words) {
      if (stopwords.has(w)) continue;
      tf[w] = (tf[w] || 0) + 1;
    }

    // Score sentences by sum of term frequencies (normalized) and slight position bonus
    const scored = sentences.map((s, idx) => {
      const sWords = s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      let score = 0;
      for (const w of sWords) {
        if (stopwords.has(w)) continue;
        score += (tf[w] || 0);
      }
      // normalize by length
      score = score / Math.max(1, sWords.length);
      // small position weight favoring earlier sentences
      const positionWeight = 1 - (idx / Math.max(1, sentences.length));
      return { idx, sentence: s, score: score * 0.8 + positionWeight * 0.2 };
    });

    // pick top 3 by score
    const top = scored.sort((a,b) => b.score - a.score).slice(0, 3).sort((a,b) => a.idx - b.idx);
    const bullets = top.map(t => t.sentence);
    const summary = bullets.map(b => `- ${b}`).join('\n');
    return res.status(200).json({ summary });
  } catch (err) {
    console.error('Local summarizer error:', err);
    return res.status(500).json({ message: 'AI summarization failed' });
  }
};

// @desc    Retrieve and reconstruct full news article using scraping
// @route   POST /api/ai/full-story
// @access  Private
const getFullStory = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(200).json({ fullText: null, scraped: false, reason: 'No URL provided' });
  }

  try {
    const axios = require('axios');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
      },
      timeout: 6000
    });

    const html = response.data;
    
    // Remove script and style elements first to avoid extracting text inside them
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, ''); // remove comments

    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let matches;
    const paragraphs = [];
    
    const noiseKeywords = [
      'cookie', 'subscribe', 'sign up', 'ad blocker', 'copyright', 
      'all rights reserved', 'reprint rights', 'times syndication', 
      'follow us', 'social media', 'privacy policy', 'terms of service', 
      'newsletter', 'advertisement', 'sponsored', 'download our app', 
      'click here', 'read also', 'also read', 'feedback', 'login', 'register'
    ];

    while ((matches = pRegex.exec(cleanHtml)) !== null) {
      let pText = matches[1]
        .replace(/<[^>]+>/g, '') // remove inner HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

      // Clean up specific social sharing button text that gets concatenated in Al Jazeera
      pText = pText.replace(/^x?whatsapp-strokecopylinkgoogleAdd Al Jazeera on Googleinfo/i, '').trim();
      pText = pText.replace(/^x?whatsapp-[\s\S]*?info/i, '').trim();

      if (pText.length > 80) {
        const lowercase = pText.toLowerCase();

        // Skip potential inline code snippets or styles
        if (pText.includes('{') || pText.includes('}') || pText.includes('var ') || pText.includes('function(')) {
          continue;
        }

        // Skip typical social sharing elements
        const isSocialShare = pText.length < 180 && (
          lowercase.includes('share') ||
          lowercase.includes('whatsapp') ||
          lowercase.includes('facebook') ||
          lowercase.includes('twitter') ||
          lowercase.includes('linkedin') ||
          lowercase.includes('pinterest') ||
          lowercase.includes('telegram') ||
          lowercase.includes('copy link') ||
          lowercase.includes('follow on') ||
          lowercase.includes('follow al jazeera')
        );

        const isNoise = noiseKeywords.some(keyword => lowercase.includes(keyword));
        if (!isNoise && !isSocialShare) {
          paragraphs.push(pText);
        }
      }
    }

    if (paragraphs.length >= 2) {
      const fullText = paragraphs.slice(0, 15).join('\n\n'); // Limit to 15 paragraphs max
      return res.status(200).json({ fullText, scraped: true });
    } else {
      return res.status(200).json({ fullText: null, scraped: false, reason: 'Too few paragraphs extracted' });
    }
  } catch (err) {
    console.error('Server side scraper error:', err.message);
    return res.status(200).json({ fullText: null, scraped: false, reason: err.message });
  }
};

module.exports = { summarizeNews, getFullStory };
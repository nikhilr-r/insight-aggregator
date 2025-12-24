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

  // If neither key available
  console.error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.');
  return res.status(500).json({ message: 'No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.' });
};

module.exports = { summarizeNews };
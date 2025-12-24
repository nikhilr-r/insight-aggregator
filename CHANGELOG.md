# Changelog

All notable changes to this project are documented in this file.

## [Unreleased] - 2025-12-24

- feat: Sync user preferences on login and add `Preferences` button in header ([client/src/pages/HomePage.jsx])
- fix: Send Authorization header from `NewsCard` when calling AI summarizer ([client/src/components/NewsCard.jsx])
- feat: AI fallback in server `aiController.js` — try Gemini, then OpenAI, then a local extractive summarizer fallback ([server/controllers/aiController.js])
- perf: Compact `NewsCard` layout and move Summarize button to image overlay; tightened paddings and reduced image height ([client/src/components/NewsCard.jsx], [client/src/components/NewsCard.css])
- deps: added `openai` to server dependencies to enable OpenAI fallback (optional)

### Notes
- To use external AI providers, set `GEMINI_API_KEY` or `OPENAI_API_KEY` in `server/.env`.
- Server caching with Upstash Redis is optional and controlled via `ENABLE_REDIS` and Upstash env vars.

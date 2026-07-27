import { useState, useEffect } from 'react';
import './NewsModal.css';
import api from '../api';

function NewsModal({ article, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState(null);

  const [fullStory, setFullStory] = useState(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [errorStory, setErrorStory] = useState(null);
  const [scrapedSuccessfully, setScrapedSuccessfully] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch full news story
  useEffect(() => {
    const fetchFullStory = async () => {
      setLoadingStory(true);
      setErrorStory(null);
      setScrapedSuccessfully(false);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

        const response = await api.post(
          '/api/ai/full-story',
          {
            url: article.url
          },
          config
        );

        if (response.data.scraped) {
          setFullStory(response.data.fullText);
          setScrapedSuccessfully(true);
        } else {
          setFullStory(null);
          setScrapedSuccessfully(false);
        }
      } catch (err) {
        console.error("Full Story Fetch Error:", err);
        setScrapedSuccessfully(false);
      } finally {
        setLoadingStory(false);
      }
    };

    fetchFullStory();
  }, [article]);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleSummarize = async () => {
    if (summary) return; // already loaded
    setLoadingAi(true);
    setErrorAi(null);

    try {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

      const response = await api.post(
        '/api/ai/summarize',
        {
          title: article.title,
          text: fullStory || article.content || article.description || article.title
        },
        config
      );

      setSummary(response.data.summary);
    } catch (error) {
      console.error("AI Summarizer Error:", error);
      if (error.response && error.response.status === 401) {
        setErrorAi('Please log in to generate an AI summary.');
      } else {
        setErrorAi('Could not generate summary. Please try again later.');
      }
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card newspaper-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button className="newspaper-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        {/* Modal Scrollable Body */}
        <div className="modal-body newspaper-body">
          
          {/* 1. NEWSPAPER NAMEPLATE / BANNER */}
          <div className="newspaper-nameplate">
            <div className="nameplate-top">
              <span className="nameplate-vol">VOL. CLXXIV... No. 42</span>
              <span className="nameplate-title">The Insight Chronicle</span>
              <span className="nameplate-price">$1.50</span>
            </div>
            <div className="nameplate-divider-double"></div>
            <div className="nameplate-meta">
              <span className="nameplate-date">{formattedDate.toUpperCase()}</span>
              <span className="nameplate-edition">LATE CITY EDITION</span>
            </div>
            <div className="nameplate-divider-single"></div>
          </div>

          {/* 2. HEADLINE */}
          <h1 className="newspaper-headline">{article.title}</h1>

          {/* 3. BYLINE */}
          <div className="newspaper-byline">
            <span className="byline-author">By {article.author || 'Anonymous Staff Writer'}</span>
            <span className="byline-separator">◆</span>
            <span className="byline-source">Published in {article.source.name}</span>
          </div>

          {/* 4. COVER PHOTO */}
          <div className="newspaper-media">
            {article.urlToImage ? (
              <figure className="newspaper-figure">
                <img src={article.urlToImage} alt={article.title} className="newspaper-image" />
                <figcaption className="newspaper-caption">
                  Associated photograph for the report. Source: {article.source.name}.
                </figcaption>
              </figure>
            ) : (
              <div className="newspaper-image-placeholder">
                <span className="placeholder-text">THE INSIGHT PRESS</span>
              </div>
            )}
          </div>

          {/* 5. MULTI-COLUMN CONTENT AREA */}
          <div className="newspaper-columns">
            {/* Lead Description & Content */}
            <div className="newspaper-article-text">
              {loadingStory && (
                <div className="typesetting-loader">
                  <div className="ink-press-animation">
                    <span className="press-roller"></span>
                    <span className="press-stamp"></span>
                  </div>
                  <p className="loader-text">Typesetting broadside... Please stand by.</p>
                </div>
              )}

              {errorStory && (
                <>
                  <p className="newspaper-lead-paragraph">
                    {article.description || 'No further description is available for this dispatch.'}
                  </p>
                  {article.content && (
                    <p className="newspaper-body-paragraph">
                      {article.content.replace(/\[\+\d+ chars\]$/, '')}
                    </p>
                  )}
                  <div className="typesetting-error">
                    <span className="error-ornament">⚠️</span> {errorStory}
                  </div>
                </>
              )}

              {!loadingStory && !errorStory && !scrapedSuccessfully && (
                <>
                  <p className="newspaper-lead-paragraph">
                    {article.description || 'No further description is available for this dispatch.'}
                  </p>
                  {article.content && (
                    <p className="newspaper-body-paragraph">
                      {article.content.replace(/\[\+\d+ chars\]$/, '')}
                    </p>
                  )}
                  <div className="newspaper-fallback-notice">
                    <span className="notice-ornament">❦</span>
                    <p>
                      This dispatch is presented in preview form. The publisher's layout prevents direct local reading. The full chronicle may be read on their official website via the link below.
                    </p>
                  </div>
                </>
              )}

              {!loadingStory && !errorStory && scrapedSuccessfully && fullStory && (
                fullStory.split('\n\n').map((para, idx) => {
                  const cleanPara = para.trim();
                  if (!cleanPara) return null;
                  return (
                    <p key={idx} className={idx === 0 ? "newspaper-lead-paragraph" : "newspaper-body-paragraph"}>
                      {cleanPara}
                    </p>
                  );
                })
              )}
            </div>

            {/* AI Summary Panel */}
            <div className="newspaper-editorial-box">
              <div className="editorial-header">
                <span className="editorial-ornament">❖</span> EDITORIAL DISPATCH <span className="editorial-ornament">❖</span>
              </div>
              <div className="editorial-content">
                {!summary && !loadingAi && (
                  <button className="btn-ai-trigger-classic" onClick={handleSummarize} disabled={loadingStory}>
                    ✨ Generate AI Briefing
                  </button>
                )}

                {loadingAi && (
                  <div className="ai-loading-classic">
                    <span className="spinner-glow-classic"></span>
                    <p>Typing dispatch...</p>
                  </div>
                )}

                {errorAi && (
                  <div className="ai-error-classic">
                    ⚠️ {errorAi}
                  </div>
                )}

                {summary && (
                  <div className="ai-summary-list-classic">
                    {summary.split('\n').map((line, index) => {
                      const cleanLine = line.replace(/^-\s*/, '').trim();
                      if (!cleanLine) return null;
                      return (
                        <div key={index} className="ai-summary-bullet-classic">
                          <span className="bullet-point-classic">✦</span>
                          <p>{cleanLine}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="newspaper-footer">
          <button className="btn ghost newspaper-btn" onClick={onClose}>
            Back to Feed
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary newspaper-btn-primary"
          >
            Read Original Broadside <span className="arrow-icon">↗</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

export default NewsModal;

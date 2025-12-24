import { useState } from 'react';
import './NewsCard.css'; // Assumes existing CSS styles
import api from '../api';

function NewsCard({ article }) {
  const [summary, setSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Format date professionally (e.g., "Dec 24, 2025")
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleSummarize = async (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    // Toggle view if we already have the data
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    setLoadingAi(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

      const response = await api.post(
        '/api/ai/summarize',
        {
          title: article.title,
          text: article.description || article.content || article.title
        },
        config
      );

      setSummary(response.data.summary);
      setShowSummary(true);
    } catch (error) {
      console.error("AI Error:", error);
      if (error.response && error.response.status === 401) {
        alert('Please login to use the AI summarizer.');
      } else {
        alert("Unable to generate summary at this moment.");
      }
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="news-card">
      {/* 1. HERO IMAGE SECTION */}
      <div className="card-image-container">
        {article.urlToImage ? (
          <img src={article.urlToImage} alt={article.title} />
        ) : (
          <div className="placeholder-image">Insight News</div>
        )}
        <div className="card-badge">{article.source.name}</div>
      </div>

      {/* 2. CONTENT BODY */}
      <div className="card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="card-date">{formattedDate}</span>
        </div>
        
        <h3 className="card-title">{article.title}</h3>

        {/* 3. DYNAMIC CONTENT AREA (Description vs AI Summary) */}
        <div style={{ flex: 1, marginBottom: '20px' }}>
          {showSummary && summary ? (
            <div style={{ 
              background: 'linear-gradient(135deg, #f9fafb 0%, #eff6ff 100%)',
              border: '1px solid #dbeafe',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.9rem',
              color: '#334155',
              lineHeight: '1.6',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
              animation: 'fadeIn 0.4s ease'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                marginBottom: '8px', 
                color: '#2563eb', 
                fontWeight: '600',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <span style={{ fontSize: '1rem' }}>✨</span> AI Summary
              </div>
              <div style={{ whiteSpace: 'pre-line' }}>
                {summary}
              </div>
            </div>
          ) : (
            <p className="card-desc">
              {article.description 
                ? (article.description.length > 120 
                    ? article.description.slice(0, 120) + '...' 
                    : article.description)
                : 'No preview available. Click to read the full story.'}
            </p>
          )}
        </div>

        {/* 4. ACTION FOOTER */}
        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          
          {/* Read Button */}
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary card-btn"
            style={{ flex: 1 }}
          >
            Read Story
          </a>
          
          {/* AI Button - Styled to look distinctive but clean */}
          <button 
            onClick={handleSummarize} 
            className="btn"
            style={{ 
              flex: 1,
              background: loadingAi ? '#f8fafc' : 'white',
              border: '1px solid #e2e8f0',
              color: showSummary ? '#2563eb' : '#475569',
              fontWeight: '600',
              borderColor: showSummary ? '#2563eb' : '#e2e8f0',
              transition: 'all 0.2s ease'
            }}
            disabled={loadingAi}
          >
            {loadingAi ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <span className="spinner-small"></span> Thinking...
              </span>
            ) : (
              showSummary ? 'Hide Summary' : '✨ Summarize'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
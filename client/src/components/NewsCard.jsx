import './NewsCard.css'; // We will create this small file next

function NewsCard({ article }) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="news-card">
      <div className="card-image-container">
        {article.urlToImage ? (
          <img src={article.urlToImage} alt={article.title} />
        ) : (
          <div className="placeholder-image">Insight News</div>
        )}
        <div className="card-badge">{article.source.name}</div>
      </div>

      <div className="card-content">
        <span className="card-date">{formattedDate}</span>
        <h3 className="card-title">{article.title}</h3>
        <p className="card-desc">
          {article.description ? article.description.slice(0, 100) + '...' : 'Click to read the full story.'}
        </p>
        
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary card-btn">
          Read Article
        </a>
      </div>
    </div>
  );
}

export default NewsCard;
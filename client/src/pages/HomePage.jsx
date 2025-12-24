import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import NewsCard from '../components/NewsCard';
import api from '../api';
import './Home.css'; // CRITICAL: Ensure this import exists!

function HomePage() {
  const { user, logout } = useContext(AuthContext);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const [selectedPrefs, setSelectedPrefs] = useState(user?.preferences || []);
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'in');

  // Keep local preference state in sync when user data changes (e.g., after login)
  useEffect(() => {
    setSelectedPrefs(user?.preferences || []);
    setSelectedCountry(user?.country || 'in');
  }, [user]);

  const availableTopics = [
    'Politics', 'Cricket', 'Technology', 'Startups',
    'Finance', 'Bollywood', 'Health', 'Science', 'AI', 'Travel'
  ];

  const countries = [
    { code: 'in', name: 'India', flag: '🇮🇳' },
    { code: 'us', name: 'USA', flag: '🇺🇸' },
    { code: 'gb', name: 'UK', flag: '🇬🇧' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' }
  ];

  const fetchNews = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await api.get('/api/news', config);
      setArticles(data);
      setVisibleCount(9);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const toggleTopic = (topic) => {
    setSelectedPrefs(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };
  const [theme, setTheme] = useState(
  localStorage.getItem('theme') || 'dark'
);

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);

const toggleTheme = () => {
  setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
};


  const handleSavePreferences = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

      await api.put(
        '/api/users/preferences',
        { preferences: selectedPrefs, country: selectedCountry },
        config
      );

      storedUser.preferences = selectedPrefs;
      storedUser.country = selectedCountry;
      localStorage.setItem('user', JSON.stringify(storedUser));

      setShowPreferences(false);
      fetchNews();
    } catch {
      alert('Failed to update preferences');
    }
  };

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
  <div className="header-left">
    <span className="logo">🗞️</span>
    <h1 className="brand-name">Insight</h1>
  </div>

  <nav className="header-nav">
    <a href="#features">Features</a>
    <a href="#topics">Topics</a>
    <a href="#how">How it works</a>
  </nav>

  <div className="header-actions">
  <button
    className="theme-toggle"
    onClick={toggleTheme}
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? '🌙' : '☀️'}
  </button>

  {!user ? (
    <>
      <Link to="/login" className="btn ghost">Login</Link>
      <Link to="/register" className="btn primary">Get Started</Link>
    </>
  ) : (
    <>
      <button onClick={() => setShowPreferences(true)} className="btn ghost">Preferences</button>
      <button onClick={logout} className="btn danger">Logout</button>
    </>
  )}
</div>

</header>


      {/* CONTENT */}
      <main className="content">
        {!user ? (
         <section className="hero">
  <span className="hero-badge">⚡ Smart News Aggregator</span>

  <h2>
    Personalized News. <br />
    <span className="accent">Zero Noise.</span>
  </h2>

  <p>
    Follow topics you care about. Choose your region. <br />
    Get only what matters — nothing else.
  </p>

  <div className="hero-actions">
    <Link to="/register" className="btn primary">
      Create Free Account
    </Link>
   
  </div>
</section>
        ) : (
          <>
            {showPreferences && (
              <section className="panel">
                <div className="panel-block">
                  <h4>Region</h4>
                  <div className="chip-row">
                    {countries.map(c => (
                      <button
                        key={c.code}
                        className={`chip ${selectedCountry === c.code ? 'active' : ''}`}
                        onClick={() => setSelectedCountry(c.code)}
                      >
                        {c.flag} {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel-block">
                  <h4>Topics</h4>
                  <div className="chip-row">
                    {availableTopics.map(topic => (
                      <button
                        key={topic}
                        className={`chip ${selectedPrefs.includes(topic) ? 'active' : ''}`}
                        onClick={() => toggleTopic(topic)}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn primary" onClick={handleSavePreferences}>
                  Save Preferences
                </button>
              </section>
            )}

            {loading ? (
              <p className="status">Loading feed...</p>
            ) : (
              <section className="grid">
                {articles.slice(0, visibleCount).map((article, i) => (
                  <NewsCard key={i} article={article} />
                ))}
              </section>
            )}

            {visibleCount < articles.length && (
              <div className="load-more">
                <button
                  className="btn ghost"
                  onClick={() => setVisibleCount(v => v + 9)}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;

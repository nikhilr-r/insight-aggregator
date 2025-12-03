import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import NewsCard from '../components/NewsCard';
import { Link } from 'react-router-dom';
import api from '../api'; // FIX 1: Ensure api.js exists in src folder

function HomePage() {
  const { user, logout } = useContext(AuthContext);
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9); 
  
  // State for Preferences & Country
  const [selectedPrefs, setSelectedPrefs] = useState(user?.preferences || []);
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'in');

  const availableTopics = [
    'Politics', 'Cricket', 'Technology', 'Startups', 'Finance', 
    'Bollywood', 'Health', 'Science', 'AI', 'Travel'
  ];

  const countries = [
    { code: 'in', name: 'India', flag: '🇮🇳' },
    { code: 'us', name: 'USA', flag: '🇺🇸' },
    { code: 'gb', name: 'UK', flag: '🇬🇧' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' }
  ];

  // --- FIX 2: useCallback prevents the Infinite Loop Error ---
  const fetchNews = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      
      const { data } = await api.get('/api/news', config);
      setArticles(data);
      setVisibleCount(9); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching news:", error);
      setLoading(false);
    }
  }, [user]);

  const handleSavePreferences = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

      // Send preferences AND country
      await api.put('/api/users/preferences', { 
        preferences: selectedPrefs,
        country: selectedCountry 
      }, config);
      
      // Update local storage
      storedUser.preferences = selectedPrefs;
      storedUser.country = selectedCountry;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      setShowPreferences(false);
      fetchNews(); 
      alert('Feed Updated!');
    } catch (error) {
      alert('Failed to update preferences');
    }
  };

  const toggleTopic = (topic) => {
    if (selectedPrefs.includes(topic)) {
      setSelectedPrefs(selectedPrefs.filter(t => t !== topic));
    } else {
      setSelectedPrefs([...selectedPrefs, topic]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNews();
    }
  }, [user, fetchNews]);

  return (
    <div className="container" style={{ paddingBottom: '50px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '2rem' }}>📰</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Insight News</h1>
        </div>
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => setShowPreferences(!showPreferences)} className="btn btn-outline">
                {showPreferences ? 'Close Settings' : 'Customize Feed'}
              </button>
              <button onClick={logout} className="btn btn-danger">Logout</button>
            </div>
          ) : (
             <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      <main>
        {!user ? (
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <h1>Your News. Your World.</h1>
            <p>Select your interests and region.</p>
            <Link to="/register" className="btn btn-primary">Create Free Account</Link>
          </div>
        ) : (
          <>
            {showPreferences && (
              <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
                
                {/* 1. Country Selection UI */}
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Select Region</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {countries.map(c => (
                       <button 
                         key={c.code}
                         onClick={() => setSelectedCountry(c.code)}
                         style={{
                           padding: '8px 16px',
                           borderRadius: '8px',
                           border: selectedCountry === c.code ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                           background: selectedCountry === c.code ? 'rgba(37, 99, 235, 0.1)' : 'var(--input-bg)',
                           color: 'var(--text-main)',
                           cursor: 'pointer'
                         }}
                       >
                         {c.flag} {c.name}
                       </button>
                    ))}
                  </div>
                </div>

                {/* 2. Topic Selection UI */}
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Follow Topics</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {availableTopics.map(topic => (
                      <label key={topic} style={{ 
                        cursor: 'pointer', 
                        padding: '10px 20px', 
                        borderRadius: '50px', 
                        border: selectedPrefs.includes(topic) ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: selectedPrefs.includes(topic) ? 'var(--primary)' : 'var(--input-bg)',
                        color: selectedPrefs.includes(topic) ? 'white' : 'var(--text-main)',
                      }}>
                        <input 
                          type="checkbox" 
                          checked={selectedPrefs.includes(topic)}
                          onChange={() => toggleTopic(topic)}
                          style={{ display: 'none' }} 
                        />
                        {topic}
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={handleSavePreferences} className="btn btn-primary">Save & Update Feed</button>
              </div>
            )}

            {/* News Grid */}
            {loading ? <p>Loading...</p> : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                  {articles.length > 0 ? articles.slice(0, visibleCount).map((article, index) => <NewsCard key={index} article={article} />) : <p>No stories found.</p>}
               </div>
            )}
            
             {visibleCount < articles.length && (
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                  <button onClick={() => setVisibleCount(p => p + 9)} className="btn btn-outline">Load More</button>
                </div>
              )}
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
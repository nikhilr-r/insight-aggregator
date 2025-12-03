import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // CRITICAL: Ensure this import exists!

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* HEADER */}
        <div className="auth-header">
          <div className="auth-icon">👋</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Enter your details to access your personalized feed.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="auth-input"
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="auth-input"
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/register" className="auth-link">Create one for free</Link>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
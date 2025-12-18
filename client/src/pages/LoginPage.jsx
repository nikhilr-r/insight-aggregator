import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Auth.css';

function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <header className="auth-head">
          <h1 className="auth-brand">Insight</h1>
          <h2 className="auth-title">Sign in</h2>
          <p className="auth-subtitle">
            Your personalized news workspace.
          </p>
        </header>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="name@example.com"
                autoComplete="email"
               disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field password-field">
            <label>Password</label>
              <div className="password-wrapper">
                   <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(p => !p)}
                  >
                  {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <footer className="auth-footer">
          <span>New to Insight?</span>
          <Link to="/register">Create an account</Link>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;

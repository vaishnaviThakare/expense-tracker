import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import logo from '../assets/spendly-logo.png';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-split-inner">
        <div className="auth-brand-panel">
          <div className="brand-logo-row">
            <img src={logo} alt="Spendly" className="brand-logo-img" />
          </div>
          <h1 className="brand-headline">Track smart.<br />Stay in control.</h1>
          <div className="brand-rule" />
          <p className="brand-sub">A simple way to track your expenses, understand your spending, and build better money habits.</p>
          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">📈</div>
              <p className="brand-feature-title">Spending Insights</p>
              <p className="brand-feature-desc">See where your money goes</p>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">🌱</div>
              <p className="brand-feature-title">Better Habits</p>
              <p className="brand-feature-desc">Make smarter spending decisions</p>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <h1 className="wordmark" style={{ fontSize: 26 }}>Welcome back</h1>
            <p className="auth-sub">Login to continue to Spendly</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <span className="field-label">Email address</span>
                <input className="field field-with-icon" placeholder="you@example.com" type="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <span className="field-icon">✉️</span>
              </div>
              <div className="field-group">
                <span className="field-label">Password</span>
                <input className="field field-with-icon" placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="field-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="forgot-link-row">
                <Link to="/forgot-password" className="link-brass" style={{ fontSize: 12.5 }}>Forgot password?</Link>
              </div>
              <button className="btn-primary" type="submit">🔒 Log in</button>
            </form>
            {error && <p className="error-text">{error}</p>}
            <div className="auth-divider">or</div>
            <p className="auth-footer" style={{ margin: 0 }}>Don't have an account? <Link className="link-brass" to="/register">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
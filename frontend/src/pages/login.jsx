import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import logo from '../assets/spendly-logo.svg';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
                <input className="field" placeholder="you@example.com" type="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field-group">
                <span className="field-label">Password</span>
                <input className="field" placeholder="Enter your password" type="password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="btn-primary" type="submit">🔒 Log in</button>
              <Link to="/forgot-password" className="link-brass" style={{ fontSize: 12.5, textAlign: 'right' }}>Forgot password?</Link>
            </form>
            {error && <p className="error-text">{error}</p>}
            <p className="auth-footer">Don't have an account? <Link className="link-brass" to="/register">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
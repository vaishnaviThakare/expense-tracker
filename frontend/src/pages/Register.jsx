import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import logo from '../assets/spendly-logo.svg';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
            <h1 className="wordmark" style={{ fontSize: 26 }}>Create your account</h1>
            <p className="auth-sub">Start tracking with Spendly</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <span className="field-label">Full name</span>
                <input className="field" placeholder="Your name" type="text"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field-group">
                <span className="field-label">Email address</span>
                <input className="field field-with-icon" placeholder="you@example.com" type="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <span className="field-icon">✉️</span>
              </div>
              <div className="field-group">
                <span className="field-label">Password</span>
                <input className="field field-with-icon" placeholder="Create a password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="field-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button className="btn-primary" type="submit">Sign up</button>
            </form>
            {error && <p className="error-text">{error}</p>}
            <p className="auth-footer">Already have an account? <Link className="link-brass" to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
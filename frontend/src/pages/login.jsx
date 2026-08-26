import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

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
    <div className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1 className="wordmark">Spendly</h1>
        <p className="auth-sub">Sign in to see where it went.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input className="field" placeholder="Email" type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field" placeholder="Password" type="password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary" type="submit">Login</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <p className="auth-footer">No account? <Link className="link-brass" to="/register">Register</Link></p>
      </div>
    </div>
  );
}

export default Login;
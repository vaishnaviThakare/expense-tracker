import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [form, setForm] = useState({ email: '', password: '' });
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
    <div className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Create account</span>
        <h1 className="wordmark">Spendly</h1>
        <p className="auth-sub">Track. Spend. Save.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input className="field" placeholder="Email" type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field" placeholder="Password" type="password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary" type="submit">Register</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <p className="auth-footer">Already have an account? <Link className="link-brass" to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;
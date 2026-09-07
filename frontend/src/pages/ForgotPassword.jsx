import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import logo from '../assets/spendly-logo.svg';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="Spendly" style={{ height: 48, marginBottom: 20 }} />
        <h1 className="wordmark" style={{ fontSize: 24 }}>Forgot password?</h1>
        <p className="auth-sub">Enter your email and we'll send you a reset link.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input className="field" placeholder="Email" type="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-primary" type="submit">Send reset link</button>
        </form>
        {message && <p style={{ color: 'var(--brand)', fontSize: 13, marginTop: 10 }}>{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <p className="auth-footer">Remembered it? <Link className="link-brass" to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default ForgotPassword;
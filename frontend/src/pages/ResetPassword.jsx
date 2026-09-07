import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import logo from '../assets/spendly-logo.svg';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="Spendly" style={{ height: 48, marginBottom: 20 }} />
        <h1 className="wordmark" style={{ fontSize: 24 }}>Reset password</h1>
        <p className="auth-sub">Enter a new password for your account.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input className="field" placeholder="New password" type="password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn-primary" type="submit">Reset password</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <p className="auth-footer"><Link className="link-brass" to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}

export default ResetPassword;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconMail, IconLock } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="app-bg">
        <div className="app-bg__blob app-bg__blob--1" />
        <div className="app-bg__blob app-bg__blob--2" />
        <div className="app-bg__blob app-bg__blob--3" />
      </div>
      <div className="auth-card glass-strong">
        <div className="auth-brand">
          <div className="sidebar__brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0e1a" strokeWidth="2"><circle cx="12" cy="12" r="8" /></svg>
          </div>
          DayFlow
        </div>
        <h1>Welcome back</h1>
        <p className="sub">Log in to see what your day looks like.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <span className="input-icon"><IconMail width="17" height="17" /></span>
              <input
                className="input"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <span className="input-icon"><IconLock width="17" height="17" /></span>
              <input
                className="input"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}

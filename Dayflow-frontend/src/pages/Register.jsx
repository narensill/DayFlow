import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconMail, IconLock, IconUser } from '../components/Icons';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create account.');
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
        <h1>Create your account</h1>
        <p className="sub">Start planning your day, beautifully.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Name</label>
            <div className="input-wrap">
              <span className="input-icon"><IconUser width="17" height="17" /></span>
              <input className="input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Naren" />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <span className="input-icon"><IconMail width="17" height="17" /></span>
              <input className="input" type="email" required autoComplete="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
          </div>
          <div className="modal-row-2">
            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock width="17" height="17" /></span>
                <input className="input" type="password" required autoComplete="new-password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
            <div className="field">
              <label>Confirm</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock width="17" height="17" /></span>
                <input className="input" type="password" required autoComplete="new-password" value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

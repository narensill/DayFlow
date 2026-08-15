import { useEffect, useState } from 'react';
import { settingsApi } from '../api/settings';
import { categoriesApi } from '../api/categories';
import { authApi } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { LoadingSkeletonLines } from '../components/States';
import { IconSun, IconMoon, IconMonitor, IconPlus, IconTrash, IconLock } from '../components/Icons';

const REMINDER_OPTS = [
  { label: 'None', value: 0 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
];

export default function Settings() {
  const toast = useToast();
  const { themePref, setThemePref } = useTheme();
  const containerRef = useScrollReveal();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    Promise.all([settingsApi.get(), categoriesApi.list()])
      .then(([s, c]) => { setSettings(s); setCategories(c); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    try {
      const updated = await settingsApi.update({
        weatherLocation: next.weatherLocation,
        timeFormat: next.timeFormat,
        theme: next.theme,
        defaultReminderMinutes: next.defaultReminderMinutes,
      });
      setSettings(updated);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (val) => {
    setThemePref(val);
    saveSettings({ theme: val });
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const c = await categoriesApi.create({ name: newCategory.trim() });
      setCategories((prev) => [...prev, c]);
      setNewCategory('');
      toast.success('Category added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeCategory = async (c) => {
    try {
      await categoriesApi.remove(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      toast.success('Category removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="glass card"><LoadingSkeletonLines lines={5} /></div>
      </div>
    );
  }

  return (
    <div className="page" ref={containerRef}>
      <div className="page-header reveal">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Tune DayFlow to fit how you work.</p>
        </div>
        {saving && <span className="text-dim" style={{ fontSize: '0.8rem' }}>Saving…</span>}
      </div>

      <div className="glass card reveal settings-section">
        <h3>Appearance</h3>
        <div className="theme-options">
          <ThemeOpt icon={IconSun} label="Light" active={themePref === 'light'} onClick={() => applyTheme('light')} />
          <ThemeOpt icon={IconMoon} label="Dark" active={themePref === 'dark'} onClick={() => applyTheme('dark')} />
          <ThemeOpt icon={IconMonitor} label="System" active={themePref === 'system'} onClick={() => applyTheme('system')} />
        </div>
      </div>

      <div className="glass card reveal settings-section">
        <h3>Weather</h3>
        <div className="modal-row-2">
          <div className="field mb-0">
            <label>Location</label>
            <input className="input" value={settings.weatherLocation}
              onChange={(e) => setSettings({ ...settings, weatherLocation: e.target.value })}
              onBlur={() => saveSettings({})} placeholder="Mumbai" />
          </div>
          <div className="field mb-0">
            <label>Time Format</label>
            <select className="select" value={settings.timeFormat}
              onChange={(e) => saveSettings({ timeFormat: e.target.value })}>
              <option value="12-hour">12-hour</option>
              <option value="24-hour">24-hour</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass card reveal settings-section">
        <h3>Reminders</h3>
        <div className="field mb-0" style={{ maxWidth: 260 }}>
          <label>Default reminder</label>
          <select className="select" value={settings.defaultReminderMinutes}
            onChange={(e) => saveSettings({ defaultReminderMinutes: Number(e.target.value) })}>
            {REMINDER_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="glass card reveal settings-section">
        <h3>Categories</h3>
        <form onSubmit={addCategory} className="flex-row" style={{ marginBottom: 16 }}>
          <input className="input" placeholder="New category name" value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)} style={{ maxWidth: 260 }} />
          <button type="submit" className="btn btn-primary btn-sm"><IconPlus width="14" height="14" /> Add</button>
        </form>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((c) => (
            <span key={c.id} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 8px 6px 14px' }}>
              {c.name}
              <button className="icon-btn danger" style={{ width: 22, height: 22 }} onClick={() => removeCategory(c)}>
                <IconTrash width="12" height="12" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="glass card reveal settings-section" style={{ marginBottom: 0 }}>
        <h3>Change Password</h3>
        <form onSubmit={changePassword}>
          <div className="field">
            <label>Current password</label>
            <div className="input-wrap">
              <span className="input-icon"><IconLock width="16" height="16" /></span>
              <input className="input" type="password" required value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </div>
          </div>
          <div className="modal-row-2">
            <div className="field">
              <label>New password</label>
              <input className="input" type="password" required value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input className="input" type="password" required value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pwSaving}>
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ThemeOpt({ icon: Icon, label, active, onClick }) {
  return (
    <div className={`theme-opt ${active ? 'active' : ''}`} onClick={onClick}>
      <Icon width="20" height="20" />
      {label}
    </div>
  );
}

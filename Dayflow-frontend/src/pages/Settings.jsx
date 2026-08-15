import { useEffect, useState } from 'react';
import { categoriesApi } from '../api/categories';
import { authApi } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { LoadingSkeletonLines, ErrorState } from '../components/States';
import Select from '../components/Select';
import Toggle from '../components/Toggle';
import { IconSun, IconMoon, IconMonitor, IconPlus, IconTrash, IconLock } from '../components/Icons';

const REMINDER_OPTS = [
  { label: 'None', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
];

const TIME_FORMAT_OPTS = [
  { label: '12-hour (2:30 PM)', value: '12-hour' },
  { label: '24-hour (14:30)', value: '24-hour' },
];

const WEEK_START_OPTS = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
];

const PRIORITY_OPTS = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
];

const STATUS_OPTS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'InProgress' },
];

export default function Settings() {
  const toast = useToast();
  const { settings, loading, error, updateSettings, reload } = useSettings();
  const containerRef = useScrollReveal([settings]);

  const [locationDraft, setLocationDraft] = useState('');
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (settings?.weatherLocation !== undefined) {
      setLocationDraft(settings.weatherLocation);
    }
  }, [settings?.weatherLocation]);

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch((err) => toast.error(err.message))
      .finally(() => setCatLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = async (fields, successMsg) => {
    try {
      await updateSettings(fields);
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error(err.message || 'Could not save that setting.');
    }
  };

  const saveLocation = () => {
    const trimmed = locationDraft.trim();
    if (!trimmed || trimmed === settings.weatherLocation) return;
    patch({ weatherLocation: trimmed }, 'Weather location updated');
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
    if (!pwForm.newPassword || pwForm.newPassword !== pwForm.confirm) {
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

  const requestNotifPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') toast.success('Browser notifications enabled');
    else if (perm === 'denied') toast.error('Notifications blocked in your browser settings');
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header reveal">
          <div>
            <h1>Settings</h1>
            <p className="subtitle">Tune DayFlow to fit how you work.</p>
          </div>
        </div>
        <div className="glass card"><LoadingSkeletonLines lines={5} /></div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="page">
        <div className="page-header reveal">
          <div>
            <h1>Settings</h1>
          </div>
        </div>
        <ErrorState message={error || 'Could not load your settings.'} onRetry={reload} />
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
      </div>

      {/* Appearance */}
      <div className="glass card reveal settings-section">
        <h3>Appearance</h3>

        <div className="theme-options" style={{ marginBottom: 18 }}>
          <ThemeOpt icon={IconSun} label="Light" active={settings.theme === 'light'} onClick={() => patch({ theme: 'light' }, 'Theme set to Light')} />
          <ThemeOpt icon={IconMoon} label="Dark" active={settings.theme === 'dark'} onClick={() => patch({ theme: 'dark' }, 'Theme set to Dark')} />
          <ThemeOpt icon={IconMonitor} label="System" active={settings.theme === 'system'} onClick={() => patch({ theme: 'system' }, 'Theme set to System')} />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Animations</div>
            <div className="settings-row__desc">Ambient motion, hover effects, and transitions throughout the app.</div>
          </div>
          <div className="settings-row__control">
            <Toggle checked={settings.animationsEnabled} onChange={(v) => patch({ animationsEnabled: v })} label="Animations" />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Compact mode</div>
            <div className="settings-row__desc">Tighter spacing so more fits on screen at once.</div>
          </div>
          <div className="settings-row__control">
            <Toggle checked={settings.compactMode} onChange={(v) => patch({ compactMode: v })} label="Compact mode" />
          </div>
        </div>
      </div>

      {/* General preferences */}
      <div className="glass card reveal settings-section">
        <h3>Preferences</h3>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Time format</div>
            <div className="settings-row__desc">How times are displayed across the dashboard and calendar.</div>
          </div>
          <div className="settings-row__control">
            <Select value={settings.timeFormat} onChange={(v) => patch({ timeFormat: v })} options={TIME_FORMAT_OPTS} />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Week starts on</div>
            <div className="settings-row__desc">First day of the week shown on the calendar.</div>
          </div>
          <div className="settings-row__control">
            <Select value={settings.weekStartsOn} onChange={(v) => patch({ weekStartsOn: v })} options={WEEK_START_OPTS} />
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className="glass card reveal settings-section">
        <h3>Weather</h3>
        <div className="field mb-0" style={{ maxWidth: 320 }}>
          <label>Location</label>
          <input
            className="input"
            value={locationDraft}
            onChange={(e) => setLocationDraft(e.target.value)}
            onBlur={saveLocation}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="Mumbai"
          />
        </div>
      </div>

      {/* Task defaults */}
      <div className="glass card reveal settings-section">
        <h3>Task Defaults</h3>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Default priority</div>
            <div className="settings-row__desc">Applied automatically when you create a new task.</div>
          </div>
          <div className="settings-row__control">
            <Select value={settings.defaultTaskPriority} onChange={(v) => patch({ defaultTaskPriority: v })} options={PRIORITY_OPTS} />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Default status</div>
            <div className="settings-row__desc">Applied automatically when you create a new task.</div>
          </div>
          <div className="settings-row__control">
            <Select value={settings.defaultTaskStatus} onChange={(v) => patch({ defaultTaskStatus: v })} options={STATUS_OPTS} />
          </div>
        </div>
      </div>

      {/* Reminders & notifications */}
      <div className="glass card reveal settings-section">
        <h3>Reminders &amp; Notifications</h3>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Default reminder timing</div>
            <div className="settings-row__desc">Pre-filled whenever you add a new reminder.</div>
          </div>
          <div className="settings-row__control">
            <Select value={settings.defaultReminderMinutes} onChange={(v) => patch({ defaultReminderMinutes: Number(v) })} options={REMINDER_OPTS} />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Browser notifications</div>
            <div className="settings-row__desc">
              {notifPermission === 'granted' && 'Enabled — due reminders will show a system notification.'}
              {notifPermission === 'denied' && 'Blocked by your browser. Allow notifications for this site to re-enable.'}
              {notifPermission === 'default' && 'Allow DayFlow to notify you when reminders come due.'}
              {notifPermission === 'unsupported' && 'Not supported in this browser.'}
            </div>
          </div>
          <div className="settings-row__control">
            {notifPermission === 'default' ? (
              <button className="btn btn-ghost btn-sm" onClick={requestNotifPermission}>Enable</button>
            ) : (
              <Toggle
                checked={settings.browserNotificationsEnabled && notifPermission === 'granted'}
                disabled={notifPermission !== 'granted'}
                onChange={(v) => patch({ browserNotificationsEnabled: v })}
                label="Browser notifications"
              />
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="glass card reveal settings-section">
        <h3>Categories</h3>
        <form onSubmit={addCategory} className="flex-row" style={{ marginBottom: 16 }}>
          <input className="input" placeholder="New category name" value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)} style={{ maxWidth: 260 }} />
          <button type="submit" className="btn btn-primary btn-sm"><IconPlus width="14" height="14" /> Add</button>
        </form>
        {catLoading ? (
          <LoadingSkeletonLines lines={2} widths={['40%', '55%']} />
        ) : (
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
        )}
      </div>

      {/* Password */}
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

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { settingsApi } from '../api/settings';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext(null);

const DEFAULTS = {
  weatherLocation: 'Mumbai',
  timeFormat: '12-hour',
  theme: 'system',
  defaultReminderMinutes: 30,
  animationsEnabled: true,
  compactMode: false,
  weekStartsOn: 'sunday',
  defaultTaskPriority: 'Medium',
  defaultTaskStatus: 'Pending',
  browserNotificationsEnabled: true,
};

export function SettingsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { themePref, setThemePref } = useTheme();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    settingsApi
      .get()
      .then((s) => {
        setSettings(s);
        // Hydrate the visual theme from the server the first time this
        // browser sees the account (don't override an explicit local choice).
        if (!localStorage.getItem('dayflow_theme') && s.theme) {
          setThemePref(s.theme);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSettings(null);
    }
  }, [isAuthenticated]);

  // Reflect preferences onto <html> so CSS can react (compact mode, animations)
  useEffect(() => {
    const root = document.documentElement;
    const animationsEnabled = settings?.animationsEnabled ?? true;
    const compactMode = settings?.compactMode ?? false;
    root.setAttribute('data-animations', animationsEnabled ? 'on' : 'off');
    root.setAttribute('data-compact', compactMode ? 'true' : 'false');
  }, [settings]);

  const updateSettings = useCallback(async (patch) => {
    const base = settings || DEFAULTS;
    const payload = {
      weatherLocation: base.weatherLocation,
      timeFormat: base.timeFormat,
      theme: base.theme,
      defaultReminderMinutes: base.defaultReminderMinutes,
      animationsEnabled: base.animationsEnabled,
      compactMode: base.compactMode,
      weekStartsOn: base.weekStartsOn,
      defaultTaskPriority: base.defaultTaskPriority,
      defaultTaskStatus: base.defaultTaskStatus,
      browserNotificationsEnabled: base.browserNotificationsEnabled,
      ...patch,
    };
    const updated = await settingsApi.update(payload);
    setSettings(updated);
    if (patch.theme && patch.theme !== themePref) {
      setThemePref(patch.theme);
    }
    return updated;
  }, [settings, themePref, setThemePref]);

  const value = useMemo(() => ({
    settings: settings || (loading ? null : DEFAULTS),
    loading,
    error,
    reload: load,
    updateSettings,
    defaults: DEFAULTS,
  }), [settings, loading, error, load, updateSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

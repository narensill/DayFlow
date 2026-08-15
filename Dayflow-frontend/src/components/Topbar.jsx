import { IconMenu, IconSun, IconMoon, IconMonitor } from './Icons';
import { useTheme } from '../context/ThemeContext';

const THEME_CYCLE = ['dark', 'light', 'system'];
const THEME_ICON = { dark: IconMoon, light: IconSun, system: IconMonitor };

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { themePref, setThemePref } = useTheme();
  const ThemeIcon = THEME_ICON[themePref] || IconMoon;

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(themePref);
    setThemePref(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  return (
    <header className="topbar glass">
      <div className="flex-row">
        <button className="btn-icon btn-ghost btn topbar__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <IconMenu width="18" height="18" />
        </button>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{subtitle}</div>}
        </div>
      </div>
      <button className="btn btn-icon btn-ghost" onClick={cycleTheme} title={`Theme: ${themePref}`}>
        <ThemeIcon width="17" height="17" />
      </button>
    </header>
  );
}

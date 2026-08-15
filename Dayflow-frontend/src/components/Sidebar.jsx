import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard, IconCalendar, IconTasks, IconBell, IconCloud,
  IconSettings, IconUser, IconLogout,
} from './Icons';
import { initials } from '../utils/format';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/calendar', label: 'Calendar', icon: IconCalendar },
  { to: '/tasks', label: 'Tasks', icon: IconTasks },
  { to: '/reminders', label: 'Reminders', icon: IconBell },
  { to: '/weather', label: 'Weather', icon: IconCloud },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={`sidebar glass ${open ? 'open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0e1a" strokeWidth="2">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </div>
          DayFlow
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__section-label">Account</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <IconSettings />
            Settings
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="avatar">{initials(user?.name)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Loading…'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button className="nav-link" onClick={logout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <IconLogout />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

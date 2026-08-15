import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { IconDashboard, IconCalendar, IconTasks, IconBell, IconSettings } from './Icons';

const TITLES = {
  '/': ['Dashboard', "Here's what your day looks like"],
  '/calendar': ['Calendar', 'Plan around your schedule'],
  '/tasks': ['Tasks', 'Everything you need to get done'],
  '/reminders': ['Reminders', 'Never miss a moment'],
  '/weather': ['Weather', 'Conditions for your day'],
  '/settings': ['Settings', 'Tune DayFlow to you'],
};

const BOTTOM_ITEMS = [
  { to: '/', icon: IconDashboard, label: 'Home', end: true },
  { to: '/calendar', icon: IconCalendar, label: 'Calendar' },
  { to: '/tasks', icon: IconTasks, label: 'Tasks' },
  { to: '/reminders', icon: IconBell, label: 'Alerts' },
  { to: '/settings', icon: IconSettings, label: 'Settings' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [title, subtitle] = TITLES[location.pathname] || ['DayFlow', ''];

  return (
    <div className="app-shell">
      <div className="app-bg">
        <div className="app-bg__blob app-bg__blob--1" />
        <div className="app-bg__blob app-bg__blob--2" />
        <div className="app-bg__blob app-bg__blob--3" />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-column">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <Outlet />
      </div>

      <nav className="bottom-nav glass-strong">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <item.icon width="19" height="19" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

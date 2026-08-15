# DayFlow — Frontend

React + Vite frontend for the DayFlow productivity app, built on top of the existing
ASP.NET Core / PostgreSQL backend (`DayFlow-main`).

## Stack

- React 19 + Vite
- react-router-dom for routing
- Plain CSS design system (no Tailwind) — liquid-glass aesthetic, custom animations,
  scroll reveal via IntersectionObserver
- JWT auth stored in localStorage, attached to every API call
- No external UI kit — all components are hand-built and live in `src/components`

## Getting started

```bash
cd dayflow-frontend
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your API's /api base URL
npm run dev
```

The app expects the DayFlow API to be reachable at `VITE_API_BASE_URL` (default
`http://localhost:5000/api`) and configured with CORS allowing your dev origin
(`http://localhost:5173` by default — matches the backend's existing CORS config).

## Build

```bash
npm run build
```

Outputs a static build to `dist/` which can be deployed to Vercel, Netlify, etc.
Remember to set `VITE_API_BASE_URL` as an environment variable in your hosting
provider pointing at your deployed ASP.NET Core API.

## Project structure

```
src/
  api/            Thin fetch wrappers per backend resource (auth, tasks, categories,
                   events, reminders, weather, settings, dashboard) + client.js
                   (base fetch, JWT header injection, 401 handling)
  components/      Shared UI: Sidebar, Topbar, Layout, Modal, TaskCard, TaskModal,
                   EventModal, ReminderModal, Icons, States (loading/empty/error)
  context/         AuthContext (JWT/session), ThemeContext (light/dark/system),
                   ToastContext (toast notifications)
  hooks/           useScrollReveal (IntersectionObserver-based scroll animations)
  pages/           Login, Register, Dashboard, Tasks, Calendar, Reminders,
                   Weather, Settings
  utils/           date.js, format.js helpers
  App.jsx          Route table
  main.jsx         Entry point
  index.css        Full design system (glass, buttons, forms, layout, animations,
                   responsive breakpoints)
```

## Features implemented (matches the DayFlow spec)

1. Frontend project setup — Vite + React, env-based API base URL
2. Routing — react-router-dom, protected routes, redirect to /login when unauthenticated
3. API client — single fetch wrapper with JWT header injection + 401 → auto logout
4. Authentication pages — Login / Register, validation, error states
5. Main application layout — sidebar + topbar + responsive shell
6. Sidebar/navigation — active states, mobile off-canvas + bottom nav on small screens
7. Dashboard — task summary, today's schedule, today's tasks, upcoming, reminders, weather
8. Tasks — search, filter (status/category/overdue), sort, CRUD, complete toggle
9. Calendar — month grid, day detail panel, event CRUD
10. Reminders — create against tasks/events, due polling, browser Notification API,
    dismiss (calls `/reminders/{id}/trigger`)
11. Weather — current + 6-day forecast, city search, defaults to settings location
12. Settings — theme, weather location/time format, default reminder, categories
    management, change password
13. Dark/light/system theme — persisted, CSS variable-driven
14. Loading / error / empty states — skeleton shimmer, retry buttons, friendly empty states
15. Responsive/mobile UI — sidebar collapses to off-canvas drawer + bottom tab bar
16. Animations & polish — ambient animated gradient blobs, glass blur, scroll-reveal,
    staggered list entrance, hover lift, button press, toast, modal transitions

## Notes

- The backend's `Reminder` model doesn't embed the linked task/event, so the
  Reminders page cross-references `taskId`/`eventId` against separately fetched
  task/event lists to display readable labels.
- `TaskQueryParameters.sort` supports `dueDate`, `priority`, `title`, `createdAt`
  per the backend DTO — surfaced as the sort dropdown on the Tasks page.

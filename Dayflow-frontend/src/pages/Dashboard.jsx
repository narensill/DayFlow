import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { tasksApi } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { LoadingSkeletonLines, ErrorState, EmptyState } from '../components/States';
import { formatDate, formatTime, greeting, relativeToNow } from '../utils/date';
import { weatherIcon } from '../utils/format';
import { IconCheck, IconCloud, IconBell, IconTasks } from '../components/Icons';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const containerRef = useScrollReveal([data]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    dashboardApi
      .get()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleComplete = async (task) => {
    try {
      await tasksApi.complete(task.id);
      toast.success('Task completed!');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page" ref={containerRef}>
      <div className="hero-greeting reveal">
        <h1>{greeting()}, {user?.name?.split(' ')[0] || 'there'}</h1>
        <p className="subtitle">{formatDate(new Date(), { weekday: 'long', year: true })}</p>
      </div>

      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {loading && (
        <div className="grid-2 reveal">
          <div className="glass card"><LoadingSkeletonLines lines={4} /></div>
          <div className="glass card"><LoadingSkeletonLines lines={4} /></div>
        </div>
      )}

      {!loading && data && (
        <>
          <div className="stat-row reveal">
            <StatTile label="Total" value={data.taskSummary.total} accent="total" />
            <StatTile label="Completed" value={data.taskSummary.completed} accent="done" />
            <StatTile label="Pending" value={data.taskSummary.pending} accent="pending" />
            <StatTile label="Overdue" value={data.taskSummary.overdue} accent="overdue" />
          </div>

          <div className="grid-2 reveal" style={{ alignItems: 'start' }}>
            <WeatherCard weather={data.weather} />

            <div className="glass card">
              <div className="card-title-row">
                <h3><IconTasks width="17" height="17" /> Today&apos;s Schedule</h3>
                <Link to="/calendar" className="btn btn-ghost btn-sm">View calendar</Link>
              </div>
              {data.todayEvents.length === 0 ? (
                <EmptyState icon="🗓️" title="Nothing scheduled" message="Your calendar is clear for today." />
              ) : (
                data.todayEvents.map((ev) => (
                  <div key={ev.id} className="schedule-item">
                    <span className="schedule-time">{formatTime(ev.startDateTime)}</span>
                    <span className="schedule-dot" />
                    <span>{ev.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid-2 reveal" style={{ marginTop: 20, alignItems: 'start' }}>
            <div className="glass card">
              <div className="card-title-row">
                <h3><IconCheck width="17" height="17" /> Today&apos;s Tasks</h3>
                <Link to="/tasks" className="btn btn-ghost btn-sm">See all</Link>
              </div>
              {data.todayTasks.length === 0 ? (
                <EmptyState icon="✅" title="All clear" message="No tasks due today." />
              ) : (
                <div className="stagger">
                  {data.todayTasks.map((t) => (
                    <div className="task-card glass-interactive" key={t.id} style={{ marginBottom: 10 }}>
                      <div
                        className={`task-check ${t.status === 'Completed' ? 'checked' : ''}`}
                        onClick={() => t.status !== 'Completed' && toggleComplete(t)}
                      >
                        <IconCheck width="14" height="14" stroke="#0a0e1a" />
                      </div>
                      <div className="task-card__body">
                        <div className={`task-card__title ${t.status === 'Completed' ? 'done' : ''}`}>{t.title}</div>
                        <div className="task-card__meta">
                          <span className={`chip chip-priority-${t.priority.toLowerCase()}`}>{t.priority}</span>
                          {t.isOverdue && <span className="chip chip-overdue">Overdue</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass card">
              <div className="card-title-row">
                <h3><IconBell width="17" height="17" /> Upcoming Reminders</h3>
                <Link to="/reminders" className="btn btn-ghost btn-sm">See all</Link>
              </div>
              {data.upcomingReminders.length === 0 ? (
                <EmptyState icon="🔕" title="No reminders" message="You're all caught up." />
              ) : (
                data.upcomingReminders.map((r) => (
                  <div className="reminder-card glass" key={r.id} style={{ marginBottom: 10 }}>
                    <span className="reminder-bell">🔔</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {r.taskId ? 'Task reminder' : 'Event reminder'}
                      </div>
                      <div className="text-dim" style={{ fontSize: '0.78rem' }}>{relativeToNow(r.reminderTime)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {data.upcomingTasks.length > 0 && (
            <div className="glass card reveal" style={{ marginTop: 20 }}>
              <div className="card-title-row">
                <h3>Upcoming</h3>
              </div>
              <div className="stagger" style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))' }}>
                {data.upcomingTasks.slice(0, 6).map((t) => (
                  <div className="task-card glass-interactive" key={t.id}>
                    <div className="task-check">
                      <IconCheck width="14" height="14" />
                    </div>
                    <div className="task-card__body">
                      <div className="task-card__title">{t.title}</div>
                      <div className="task-card__meta">
                        <span className="chip">{formatDate(t.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatTile({ label, value, accent }) {
  return (
    <div className={`glass stat-tile accent-${accent} glass-interactive`}>
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <div className="glass card weather-card">
        <EmptyState icon={<IconCloud width="30" height="30" />} title="No weather yet" message="Set a location in Settings to see forecasts here." />
      </div>
    );
  }
  return (
    <div className="glass weather-card glass-interactive">
      <div className="weather-card__top">
        <div>
          <div style={{ fontWeight: 700 }}>{weather.location}</div>
          <div className="weather-card__temp">{Math.round(weather.temperature)}°</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>{weather.condition}</div>
        </div>
        <div className="weather-card__icon">{weatherIcon(weather.weatherCode)}</div>
      </div>
      <div className="weather-card__meta">
        <span>Feels like {Math.round(weather.feelsLike)}°</span>
        <span>Humidity {weather.humidity}%</span>
        <span>Wind {Math.round(weather.windSpeed)} km/h</span>
      </div>
      {weather.forecast?.length > 0 && (
        <div className="weather-forecast-strip">
          {weather.forecast.map((f) => (
            <div className="forecast-day" key={f.date}>
              <div className="fd-name">{formatDate(f.date).split(' ')[0]}</div>
              <div className="fd-icon">{weatherIcon(f.weatherCode)}</div>
              <div className="fd-temp">{Math.round(f.maxTemperature)}° <span className="lo">{Math.round(f.minTemperature)}°</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

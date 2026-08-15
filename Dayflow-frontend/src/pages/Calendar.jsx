import { useEffect, useState, useCallback, useMemo } from 'react';
import { eventsApi } from '../api/events';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import EventModal from '../components/EventModal';
import { ConfirmDialog } from '../components/Modal';
import { IconChevronLeft, IconChevronRight, IconPlus, IconEdit, IconTrash } from '../components/Icons';
import { formatDate, formatTime, isSameDay } from '../utils/date';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), muted: false });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, muted: true });
    if (cells.length >= 42) break;
  }
  return cells;
}

export default function Calendar() {
  const toast = useToast();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState(undefined);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useScrollReveal([events, loading]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    eventsApi
      .list()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const cells = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const eventsForDay = (date) => events.filter((ev) => isSameDay(ev.startDateTime, date))
    .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

  const selectedEvents = eventsForDay(selectedDate);

  const changeMonth = (delta) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  const submitEvent = async (payload) => {
    if (editingEvent) {
      await eventsApi.update(editingEvent.id, payload);
      toast.success('Event updated');
    } else {
      await eventsApi.create(payload);
      toast.success('Event created');
    }
    setEditingEvent(undefined);
    load();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await eventsApi.remove(deletingEvent.id);
      toast.success('Event deleted');
      setDeletingEvent(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page" ref={containerRef}>
      <div className="page-header reveal">
        <div>
          <h1>Calendar</h1>
          <p className="subtitle">Plan your days, one event at a time.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingEvent(null)}>
          <IconPlus width="17" height="17" /> Add Event
        </button>
      </div>

      {loading && <LoadingState rows={3} />}
      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="calendar-wrap reveal">
          <div className="glass card">
            <div className="calendar-header">
              <h2>{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <div className="calendar-nav">
                <button className="btn btn-icon btn-ghost" onClick={() => changeMonth(-1)}><IconChevronLeft width="16" height="16" /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); }}>Today</button>
                <button className="btn btn-icon btn-ghost" onClick={() => changeMonth(1)}><IconChevronRight width="16" height="16" /></button>
              </div>
            </div>
            <div className="calendar-grid" style={{ marginBottom: 6 }}>
              {DOW.map((d) => <div key={d} className="calendar-dow">{d}</div>)}
            </div>
            <div className="calendar-grid">
              {cells.map(({ date, muted }, i) => {
                const dayEvents = eventsForDay(date);
                const isToday = isSameDay(date, today);
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <div
                    key={i}
                    className={`calendar-cell ${muted ? 'muted' : ''} ${isToday && !isSelected ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span>{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="dot-row">
                        {dayEvents.slice(0, 3).map((_, idx) => <span key={idx} className="evt-dot" />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass card">
            <div className="day-detail-title">{formatDate(selectedDate, { weekday: 'long' })}</div>
            <div className="day-detail-sub">{formatDate(selectedDate, { year: true })}</div>

            {selectedEvents.length === 0 ? (
              <EmptyState
                icon="🌤️"
                title="Nothing scheduled"
                message="This day is wide open."
                action={<button className="btn btn-primary btn-sm" onClick={() => setEditingEvent(null)}><IconPlus width="14" height="14" /> Add Event</button>}
              />
            ) : (
              <div className="stagger">
                {selectedEvents.map((ev) => (
                  <div key={ev.id} className="event-item">
                    <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <div className="ev-time">{formatTime(ev.startDateTime)} – {formatTime(ev.endDateTime)}</div>
                        <div className="ev-title">{ev.title}</div>
                        {ev.description && <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>{ev.description}</div>}
                      </div>
                      <div className="flex-row">
                        <button className="icon-btn" onClick={() => setEditingEvent(ev)}><IconEdit width="14" height="14" /></button>
                        <button className="icon-btn danger" onClick={() => setDeletingEvent(ev)}><IconTrash width="14" height="14" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editingEvent !== undefined && (
        <EventModal
          event={editingEvent}
          defaultDate={selectedDate}
          onClose={() => setEditingEvent(undefined)}
          onSubmit={submitEvent}
        />
      )}

      {deletingEvent && (
        <ConfirmDialog
          title="Delete event"
          message={`Delete "${deletingEvent.title}"? This can't be undone.`}
          onClose={() => setDeletingEvent(null)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}

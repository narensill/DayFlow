import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { remindersApi } from '../api/reminders';
import { tasksApi } from '../api/tasks';
import { eventsApi } from '../api/events';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import ReminderModal from '../components/ReminderModal';
import { ConfirmDialog } from '../components/Modal';
import { IconPlus, IconTrash, IconBell } from '../components/Icons';
import { formatDate, formatTime, relativeToNow } from '../utils/date';

export default function Reminders() {
  const toast = useToast();
  const [reminders, setReminders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deletingReminder, setDeletingReminder] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useScrollReveal([reminders, loading]);
  const notifiedRef = useRef(new Set());

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([remindersApi.list(), tasksApi.list({}), eventsApi.list()])
      .then(([r, t, e]) => {
        setReminders(r);
        setTasks(t.filter((x) => x.dueDate));
        setEvents(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const poll = () => {
      remindersApi.due().then((due) => {
        due.forEach((r) => {
          if (notifiedRef.current.has(r.id)) return;
          notifiedRef.current.add(r.id);
          const label = describeReminder(r, taskByIdMap.current, eventByIdMap.current);
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('DayFlow reminder', { body: label });
          } else {
            toast.info(`\u{1F514} ${label}`);
          }
        });
      }).catch(() => {});
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const taskById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);
  const eventById = useMemo(() => Object.fromEntries(events.map((e) => [e.id, e])), [events]);
  const taskByIdMap = useRef(taskById);
  const eventByIdMap = useRef(eventById);
  useEffect(() => { taskByIdMap.current = taskById; }, [taskById]);
  useEffect(() => { eventByIdMap.current = eventById; }, [eventById]);

  const submitReminder = async (payload) => {
    await remindersApi.create(payload);
    toast.success('Reminder created');
    setShowModal(false);
    load();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await remindersApi.remove(deletingReminder.id);
      toast.success('Reminder deleted');
      setDeletingReminder(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const dismiss = async (r) => {
    try {
      await remindersApi.trigger(r.id);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sorted = [...reminders].sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime));

  return (
    <div className="page" ref={containerRef}>
      <div className="page-header reveal">
        <div>
          <h1>Reminders</h1>
          <p className="subtitle">Stay ahead of tasks and events.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus width="17" height="17" /> Add Reminder
        </button>
      </div>

      {loading && <LoadingState rows={3} />}
      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && sorted.length === 0 && (
        <EmptyState
          icon="🔔"
          title="No reminders yet"
          message="Add a reminder to a task or event and DayFlow will notify you."
          action={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><IconPlus width="15" height="15" /> Add Reminder</button>}
        />
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="stagger">
          {sorted.map((r) => {
            const isDue = new Date(r.reminderTime) <= new Date() && !r.isTriggered;
            const label = describeReminder(r, taskById, eventById);
            return (
              <div key={r.id} className={`reminder-card glass glass-interactive ${isDue ? 'due' : ''}`} style={{ marginBottom: 12, justifyContent: 'space-between' }}>
                <div className="flex-row">
                  <span className="reminder-bell"><IconBell width="20" height="20" /></span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                      {formatDate(r.reminderTime)} · {formatTime(r.reminderTime)} · {relativeToNow(r.reminderTime)}
                      {r.isTriggered && ' · Notified'}
                    </div>
                  </div>
                </div>
                <div className="flex-row">
                  {isDue && <button className="btn btn-ghost btn-sm" onClick={() => dismiss(r)}>Dismiss</button>}
                  <button className="icon-btn danger" onClick={() => setDeletingReminder(r)}><IconTrash width="15" height="15" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ReminderModal
          tasks={tasks}
          events={events}
          onClose={() => setShowModal(false)}
          onSubmit={submitReminder}
        />
      )}

      {deletingReminder && (
        <ConfirmDialog
          title="Delete reminder"
          message="Delete this reminder? This can't be undone."
          onClose={() => setDeletingReminder(null)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}

function describeReminder(r, taskById, eventById) {
  if (r.taskId) {
    const t = taskById?.[r.taskId];
    return t ? `Task: ${t.title}` : 'Task reminder';
  }
  if (r.eventId) {
    const e = eventById?.[r.eventId];
    return e ? `Event: ${e.title}` : 'Event reminder';
  }
  return 'Reminder';
}

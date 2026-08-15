import { useEffect, useState } from 'react';
import Modal from './Modal';
import { formatDateTimeInput } from '../utils/date';

export default function EventModal({ event, defaultDate, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', startDateTime: '', endDateTime: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        startDateTime: formatDateTimeInput(event.startDateTime),
        endDateTime: formatDateTimeInput(event.endDateTime),
      });
    } else if (defaultDate) {
      const d = new Date(defaultDate);
      d.setHours(9, 0, 0, 0);
      const end = new Date(d.getTime() + 60 * 60000);
      setForm((f) => ({ ...f, startDateTime: formatDateTimeInput(d), endDateTime: formatDateTimeInput(end) }));
    }
  }, [event, defaultDate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required.');
    if (!form.startDateTime || !form.endDateTime) return setError('Start and end time are required.');
    if (new Date(form.endDateTime) < new Date(form.startDateTime)) return setError('End time must be after start time.');
    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description || null,
        startDateTime: new Date(form.startDateTime).toISOString(),
        endDateTime: new Date(form.endDateTime).toISOString(),
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={event ? 'Edit Event' : 'Add Event'} onClose={onClose}>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Title</label>
          <input className="input" value={form.title} maxLength={200} autoFocus
            onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="DayFlow Development" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={form.description} maxLength={2000}
            onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details…" />
        </div>
        <div className="modal-row-2">
          <div className="field">
            <label>Start</label>
            <input className="input" type="datetime-local" value={form.startDateTime}
              onChange={(e) => setForm({ ...form, startDateTime: e.target.value })} />
          </div>
          <div className="field">
            <label>End</label>
            <input className="input" type="datetime-local" value={form.endDateTime}
              onChange={(e) => setForm({ ...form, endDateTime: e.target.value })} />
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : event ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

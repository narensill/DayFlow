import { useState } from 'react';
import Modal from './Modal';

const PRESETS = [
  { label: 'At time', minutes: 0 },
  { label: '5 minutes before', minutes: 5 },
  { label: '10 minutes before', minutes: 10 },
  { label: '30 minutes before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '1 day before', minutes: 1440 },
];

export default function ReminderModal({ tasks, events, onClose, onSubmit }) {
  const [linkType, setLinkType] = useState('task');
  const [linkId, setLinkId] = useState('');
  const [minutesBefore, setMinutesBefore] = useState(30);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!linkId) {
      setError(`Please select a ${linkType}.`);
      return;
    }
    setSaving(true);
    try {
      const payload = { minutesBefore: Number(minutesBefore) };
      if (linkType === 'task') payload.taskId = Number(linkId);
      else payload.eventId = Number(linkId);
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const options = linkType === 'task' ? tasks : events;

  return (
    <Modal title="Add Reminder" onClose={onClose}>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Remind me about</label>
          <div className="tab-row" style={{ marginBottom: 0 }}>
            <button type="button" className={`tab-btn ${linkType === 'task' ? 'active' : ''}`} onClick={() => { setLinkType('task'); setLinkId(''); }}>A Task</button>
            <button type="button" className={`tab-btn ${linkType === 'event' ? 'active' : ''}`} onClick={() => { setLinkType('event'); setLinkId(''); }}>An Event</button>
          </div>
        </div>
        <div className="field">
          <label>{linkType === 'task' ? 'Task' : 'Event'}</label>
          <select className="select" value={linkId} onChange={(e) => setLinkId(e.target.value)}>
            <option value="">Select {linkType}…</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
          {options.length === 0 && (
            <div className="text-dim" style={{ fontSize: '0.78rem', marginTop: 6 }}>
              No {linkType}s with a due date/time available yet.
            </div>
          )}
        </div>
        <div className="field">
          <label>Reminder timing</label>
          <select className="select" value={minutesBefore} onChange={(e) => setMinutesBefore(e.target.value)}>
            {PRESETS.map((p) => <option key={p.minutes} value={p.minutes}>{p.label}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Reminder'}</button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from 'react';
import Modal from './Modal';
import Select from './Select';
import { useSettings } from '../context/SettingsContext';

const PRESETS = [
  { label: 'At time', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
];

export default function ReminderModal({ tasks, events, onClose, onSubmit }) {
  const { settings } = useSettings();
  const [linkType, setLinkType] = useState('task');
  const [linkId, setLinkId] = useState('');
  const [minutesBefore, setMinutesBefore] = useState(settings?.defaultReminderMinutes ?? 30);
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
  const linkOpts = options.map((o) => ({ label: o.title, value: o.id }));

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
          <Select
            value={linkId}
            onChange={setLinkId}
            options={linkOpts}
            placeholder={`Select ${linkType}…`}
          />
          {options.length === 0 && (
            <div className="text-dim" style={{ fontSize: '0.78rem', marginTop: 6 }}>
              No {linkType}s with a due date/time available yet.
            </div>
          )}
        </div>
        <div className="field">
          <label>Reminder timing</label>
          <Select value={minutesBefore} onChange={(v) => setMinutesBefore(Number(v))} options={PRESETS} />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Reminder'}</button>
        </div>
      </form>
    </Modal>
  );
}
import { useEffect, useState } from 'react';
import Modal from './Modal';
import Select from './Select';
import { useSettings } from '../context/SettingsContext';
import { formatDateTimeInput } from '../utils/date';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUS_OPTS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export default function TaskModal({ task, categories, onClose, onSubmit }) {
  const { settings } = useSettings();

  const buildDefaultForm = () => ({
    title: '',
    description: '',
    dueDate: '',
    priority: settings?.defaultTaskPriority || 'Medium',
    status: settings?.defaultTaskStatus || 'Pending',
    categoryId: categories?.[0]?.id || '',
  });

  const [form, setForm] = useState(buildDefaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? formatDateTimeInput(task.dueDate) : '',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        categoryId: task.categoryId || categories?.[0]?.id || '',
      });
    } else {
      setForm(buildDefaultForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.categoryId) {
      setError('Please choose a category.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        priority: form.priority,
        status: form.status,
        categoryId: Number(form.categoryId),
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const categoryOpts = (categories || []).map((c) => ({ label: c.name, value: c.id }));

  return (
    <Modal title={task ? 'Edit Task' : 'Add Task'} onClose={onClose}>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Title</label>
          <input className="input" value={form.title} maxLength={200}
            onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Finish DayFlow frontend" autoFocus />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={form.description} maxLength={1000}
            onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details…" />
        </div>
        <div className="field">
          <label>Due date</label>
          <input className="input" type="datetime-local" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div className="modal-row-2">
          <div className="field">
            <label>Priority</label>
            <Select
              value={form.priority}
              onChange={(v) => setForm({ ...form, priority: v })}
              options={PRIORITIES.map((p) => ({ label: p, value: p }))}
            />
          </div>
          <div className="field">
            <label>Status</label>
            <Select value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUS_OPTS} />
          </div>
        </div>
        <div className="field">
          <label>Category</label>
          <Select
            value={form.categoryId}
            onChange={(v) => setForm({ ...form, categoryId: v })}
            options={categoryOpts}
            placeholder="Select a category…"
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
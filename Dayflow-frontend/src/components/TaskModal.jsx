import { useEffect, useState } from 'react';
import Modal from './Modal';
import { formatDateTimeInput } from '../utils/date';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'InProgress', 'Completed', 'Cancelled'];

export default function TaskModal({ task, categories, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
    categoryId: categories?.[0]?.id || '',
  });
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
            <select className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Category</label>
          <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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

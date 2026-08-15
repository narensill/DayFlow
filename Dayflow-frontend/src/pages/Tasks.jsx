import { useEffect, useState, useCallback, useMemo } from 'react';
import { tasksApi } from '../api/tasks';
import { categoriesApi } from '../api/categories';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { ConfirmDialog } from '../components/Modal';
import Select from '../components/Select';
import { IconPlus, IconSearch } from '../components/Icons';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'InProgress', label: 'In Progress' },
  { key: 'Completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
];

export default function Tasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('dueDate');
  const [editingTask, setEditingTask] = useState(undefined);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useScrollReveal([tasks, loading]);

  const query = useMemo(() => {
    const q = { sort };
    if (search.trim()) q.search = search.trim();
    if (categoryFilter) q.categoryId = categoryFilter;
    if (tab === 'overdue') q.overdue = true;
    else if (tab !== 'all') q.status = tab;
    return q;
  }, [tab, search, categoryFilter, sort]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    tasksApi
      .list(query)
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { categoriesApi.list().then(setCategories).catch(() => {}); }, []);

  const toggleComplete = async (task) => {
    try {
      await tasksApi.complete(task.id);
      toast.success(task.status === 'Completed' ? 'Task reopened' : 'Task completed!');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitTask = async (payload) => {
    if (editingTask) {
      await tasksApi.update(editingTask.id, payload);
      toast.success('Task updated');
    } else {
      await tasksApi.create(payload);
      toast.success('Task created');
    }
    setEditingTask(undefined);
    load();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await tasksApi.remove(deletingTask.id);
      toast.success('Task deleted');
      setDeletingTask(null);
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
          <h1>Tasks</h1>
          <p className="subtitle">Everything you need to get done today and beyond.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingTask(null)}>
          <IconPlus width="17" height="17" /> Add Task
        </button>
      </div>

      <div className="toolbar reveal">
        <div className="input-wrap search-box">
          <span className="input-icon"><IconSearch width="16" height="16" /></span>
          <input className="input" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex-row">
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ label: 'All categories', value: '' }, ...categories.map((c) => ({ label: c.name, value: c.id }))]}
            size="sm"
            style={{ width: 170 }}
          />
          <Select
            value={sort}
            onChange={setSort}
            size="sm"
            style={{ width: 170 }}
            options={[
              { label: 'Sort: Due date', value: 'dueDate' },
              { label: 'Sort: Priority', value: 'priority' },
              { label: 'Sort: Title', value: 'title' },
              { label: 'Sort: Created', value: 'createdAt' },
            ]}
          />
        </div>
      </div>

      <div className="tab-row reveal">
        {TABS.map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <LoadingState rows={4} />}
      {error && !loading && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          icon="🗒️"
          title="No tasks found"
          message="Try adjusting your filters, or add a new task to get started."
          action={<button className="btn btn-primary btn-sm" onClick={() => setEditingTask(null)}><IconPlus width="15" height="15" /> Add Task</button>}
        />
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="stagger">
          {tasks.map((task) => (
            <div key={task.id} style={{ marginBottom: 12 }}>
              <TaskCard
                task={task}
                onToggle={toggleComplete}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
              />
            </div>
          ))}
        </div>
      )}

      {editingTask !== undefined && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onClose={() => setEditingTask(undefined)}
          onSubmit={submitTask}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete task"
          message={`Delete "${deletingTask.title}"? This can't be undone.`}
          onClose={() => setDeletingTask(null)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}
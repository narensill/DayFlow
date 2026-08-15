import { IconCheck, IconEdit, IconTrash } from './Icons';
import { formatDate } from '../utils/date';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === 'Completed';
  return (
    <div className="task-card glass glass-interactive">
      <div className={`task-check ${done ? 'checked' : ''}`} onClick={() => onToggle(task)}>
        <IconCheck width="14" height="14" stroke="#0a0e1a" />
      </div>
      <div className="task-card__body">
        <div className={`task-card__title ${done ? 'done' : ''}`}>{task.title}</div>
        {task.description && <div className="task-card__desc">{task.description}</div>}
        <div className="task-card__meta">
          <span className="chip">{task.category?.name || 'Uncategorized'}</span>
          <span className={`chip chip-priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
          {task.status !== 'Pending' && !done && (
            <span className={`chip chip-status-${task.status.toLowerCase()}`}>{task.status === 'InProgress' ? 'In Progress' : task.status}</span>
          )}
          {task.isOverdue && <span className="chip chip-overdue">Overdue</span>}
          {task.dueDate && <span className="chip">{formatDate(task.dueDate)}</span>}
        </div>
      </div>
      <div className="task-card__actions">
        <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit"><IconEdit width="15" height="15" /></button>
        <button className="icon-btn danger" onClick={() => onDelete(task)} aria-label="Delete"><IconTrash width="15" height="15" /></button>
      </div>
    </div>
  );
}

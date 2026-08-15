import { IconAlert, IconRefresh } from './Icons';

export function LoadingState({ rows = 3 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card glass" />
      ))}
    </div>
  );
}

export function LoadingSkeletonLines({ lines = 3, widths }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-line"
          style={{ width: widths?.[i] || `${90 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

export function EmptyState({ icon = '✨', title, message, action }) {
  return (
    <div className="state-block fade-in-up">
      <div className="state-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-block fade-in-up">
      <div className="state-icon"><IconAlert width="40" height="40" /></div>
      <h3>Something went wrong</h3>
      <p>{message || 'Unable to load this data right now.'}</p>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          <IconRefresh width="16" height="16" /> Try again
        </button>
      )}
    </div>
  );
}

export function Spinner({ size = 'md' }) {
  return <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />;
}

export function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <Spinner size="lg" />
    </div>
  );
}

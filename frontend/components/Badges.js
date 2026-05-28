export function StatusBadge({ status }) {
  const map = {
    OPEN: { cls: 'badge-open', icon: 'bi-circle', label: 'Open' },
    IN_PROGRESS: { cls: 'badge-in-progress', icon: 'bi-arrow-repeat', label: 'In Progress' },
    RESOLVED: { cls: 'badge-resolved', icon: 'bi-check-circle', label: 'Resolved' },
    CLOSED: { cls: 'badge-closed', icon: 'bi-x-circle', label: 'Closed' },
  };
  const item = map[status] || { cls: 'badge-closed', icon: 'bi-question-circle', label: status };
  return (
    <span className={`badge rounded-pill px-3 py-2 ${item.cls}`} style={{fontSize:'0.78rem'}}>
      <i className={`bi ${item.icon} me-1`}></i>{item.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    LOW: { cls: 'badge-low', icon: 'bi-arrow-down', color: '#22c55e' },
    MEDIUM: { cls: 'badge-medium', icon: 'bi-dash', color: '#f59e0b' },
    HIGH: { cls: 'badge-high', icon: 'bi-arrow-up', color: '#f97316' },
    URGENT: { cls: 'badge-urgent', icon: 'bi-exclamation-triangle', color: '#ef4444' },
  };
  const item = map[priority] || { cls: 'badge-low', icon: 'bi-dash', color: '#94a3b8' };
  return (
    <span className={`badge rounded-pill px-3 py-2 ${item.cls}`} style={{fontSize:'0.78rem'}}>
      <i className={`bi ${item.icon} me-1`}></i>{priority}
    </span>
  );
}

export function RoleBadge({ role }) {
  const map = {
    ADMIN: { bg: '#f5f3ff', color: '#6d28d9', icon: 'bi-shield-check' },
    SUPPORT_AGENT: { bg: '#eff6ff', color: '#1d4ed8', icon: 'bi-headset' },
    USER: { bg: '#f0fdf4', color: '#15803d', icon: 'bi-person' },
  };
  const item = map[role] || { bg: '#f1f5f9', color: '#475569', icon: 'bi-person' };
  return (
    <span className="badge px-3 py-2 rounded-pill" style={{background: item.bg, color: item.color, fontSize:'0.78rem'}}>
      <i className={`bi ${item.icon} me-1`}></i>{role?.replace('_',' ')}
    </span>
  );
}

export function StarRating({ rating, onChange }) {
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          className={`star ${rating >= star ? 'filled' : ''}`}
          onClick={() => onChange && onChange(star)}
        >★</span>
      ))}
    </div>
  );
}

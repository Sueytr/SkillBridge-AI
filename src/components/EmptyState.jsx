import React from 'react';
import { Layers } from 'lucide-react';

const EmptyState = ({ icon: Icon = Layers, title, description, actionText, onAction, phaseNotice }) => {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.25rem auto', fontSize: '0.9rem', lineHeight: '1.6' }}>
        {description}
      </p>
      {phaseNotice && (
        <div style={{ margin: '0 auto 1.25rem auto', maxWidth: '440px' }}>
          <span className="badge badge-amber">
            {phaseNotice}
          </span>
        </div>
      )}
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

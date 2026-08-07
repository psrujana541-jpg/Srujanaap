import React from 'react';
import { Clock } from 'lucide-react';

export default function Timer({ timeLeft = 0, totalTime = 80 }) {
  const isWarning = timeLeft <= 15;
  const isCritical = timeLeft <= 5;

  const color = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--accent-indigo)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: `1.5px solid ${color}`,
        padding: '6px 14px',
        borderRadius: 'var(--radius-md)',
        color: color,
        fontWeight: 700,
        fontSize: '1.1rem',
        boxShadow: isWarning ? `0 0 12px ${color}` : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <Clock size={18} className={isWarning ? 'animate-pulse' : ''} />
      <span>{timeLeft}s</span>
    </div>
  );
}

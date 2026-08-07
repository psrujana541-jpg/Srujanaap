import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WordSelectModal({ words = [], onSelectWord, timeLeft }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '90%',
          maxWidth: '480px',
          padding: '28px',
          textAlign: 'center',
          border: '1.5px solid var(--accent-indigo)',
          boxShadow: '0 0 40px rgba(99,102,241,0.3)'
        }}
      >
        <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(99,102,241,0.15)', borderRadius: '50%', marginBottom: '12px' }}>
          <Sparkles size={32} style={{ color: 'var(--accent-amber)' }} />
        </div>

        <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '6px' }}>
          Choose a Word!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
          You have <strong style={{ color: 'var(--accent-amber)' }}>{timeLeft}s</strong> to make a selection
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {words.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => onSelectWord(word)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '1.2rem',
                textTransform: 'capitalize',
                justifyContent: 'center'
              }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

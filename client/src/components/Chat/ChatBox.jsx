import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';

export default function ChatBox({ messages = [], closeHint = null }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, closeHint]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '12px',
        overflowY: 'auto'
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: '40px', fontSize: '0.9rem' }}>
            <MessageSquare size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
            <p>Guesses & chat messages will appear here!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              const isCorrect = msg.type === 'correct';
              return (
                <div
                  key={msg.id}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                    borderLeft: `4px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-indigo)'}`,
                    color: isCorrect ? '#6ee7b7' : '#a5b4fc',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {msg.message}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginRight: '6px' }}>
                  {msg.sender}:
                </span>
                <span style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>
                  {msg.message}
                </span>
              </div>
            );
          })
        )}

        {/* Close guess amber alert */}
        {closeHint && (
          <div
            className="animate-fade-in"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.25)',
              borderLeft: '4px solid var(--accent-amber)',
              color: '#fde047',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            🔥 {closeHint}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

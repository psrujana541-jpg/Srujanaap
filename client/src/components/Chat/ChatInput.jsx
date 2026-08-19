import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled, placeholder }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 12px',
        borderTop: '1px solid var(--card-border)',
        background: 'rgba(15, 23, 42, 0.4)'
      }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? (placeholder || 'Drawing or already guessed...') : 'Type your guess here...'}
        className="input-field"
        style={{ flex: 1, padding: '10px 14px', fontSize: '1rem' }}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="btn-primary"
        style={{
          padding: '8px 16px',
          opacity: disabled || !text.trim() ? 0.5 : 1,
          cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer'
        }}
      >
        <Send size={16} />
      </button>
    </form>
  );
}

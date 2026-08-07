import React from 'react';
import { RefreshCw } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#3b82f6'];

export function AvatarSvg({ avatar, size = 64 }) {
  const { color = '#6366f1', eyes = 1, mouth = 1 } = avatar || {};

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
      {/* Body Circle */}
      <circle cx="50" cy="50" r="44" fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="3" />

      {/* Eyes */}
      {eyes === 1 && (
        <>
          <circle cx="36" cy="42" r="6" fill="#ffffff" />
          <circle cx="64" cy="42" r="6" fill="#ffffff" />
          <circle cx="37" cy="43" r="3" fill="#0f172a" />
          <circle cx="65" cy="43" r="3" fill="#0f172a" />
        </>
      )}
      {eyes === 2 && (
        <>
          {/* Happy Winking Eyes */}
          <path d="M 30 44 Q 36 36 42 44" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 58 44 Q 64 36 70 44" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}
      {eyes === 3 && (
        <>
          {/* Cool Sunglasses */}
          <rect x="25" y="36" width="22" height="14" rx="3" fill="#0f172a" />
          <rect x="53" y="36" width="22" height="14" rx="3" fill="#0f172a" />
          <line x1="47" y1="41" x2="53" y2="41" stroke="#0f172a" strokeWidth="3" />
        </>
      )}

      {/* Mouth */}
      {mouth === 1 && (
        <path d="M 35 62 Q 50 76 65 62" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
      {mouth === 2 && (
        <circle cx="50" cy="64" r="8" fill="#ffffff" />
      )}
      {mouth === 3 && (
        <path d="M 36 65 L 64 65" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

export default function AvatarPicker({ avatar, onChange }) {
  const randomize = () => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const nextEyes = Math.floor(Math.random() * 3) + 1;
    const nextMouth = Math.floor(Math.random() * 3) + 1;
    onChange({ color: nextColor, eyes: nextEyes, mouth: nextMouth });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div 
        style={{ 
          position: 'relative', 
          padding: '12px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '50%',
          border: '2px dashed var(--accent-purple)'
        }}
      >
        <AvatarSvg avatar={avatar} size={90} />
        <button
          type="button"
          onClick={randomize}
          title="Randomize Avatar"
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            background: 'var(--accent-indigo)',
            color: 'white',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* Quick Color Chips */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ ...avatar, color: c })}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: c,
              border: avatar?.color === c ? '2px solid white' : 'none',
              transform: avatar?.color === c ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.15s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}

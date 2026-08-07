import React from 'react';
import { Crown, Pencil, CheckCircle2 } from 'lucide-react';
import { AvatarSvg } from './AvatarPicker';

export default function PlayerList({ players = [], drawerId, myId }) {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sortedPlayers.map((player, index) => {
        const isMe = player.id === myId;
        const isDrawer = player.id === drawerId;

        return (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: isMe 
                ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: isMe ? '1.5px solid var(--accent-indigo)' : '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Rank Badge */}
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: index === 0 ? '#f59e0b' : index === 1 ? '#cbd5e1' : index === 2 ? '#b45309' : 'var(--text-dim)',
                  width: '18px',
                  textAlign: 'center'
                }}
              >
                #{index + 1}
              </span>

              {/* Avatar */}
              <AvatarSvg avatar={player.avatar} size={36} />

              {/* Name & Indicators */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isMe ? 'white' : 'var(--text-main)' }}>
                    {player.name} {isMe && '(You)'}
                  </span>
                  {player.isHost && (
                    <Crown size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} title="Room Host" />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isDrawer ? (
                    <span style={{ color: 'var(--accent-amber)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <Pencil size={12} /> Drawing
                    </span>
                  ) : player.hasGuessed ? (
                    <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> Guessed!
                    </span>
                  ) : (
                    <span>Guessing...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-purple)' }}>
                {player.score} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-dim)' }}>pts</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

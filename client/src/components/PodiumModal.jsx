import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Medal, RotateCcw } from 'lucide-react';
import { AvatarSvg } from './AvatarPicker';

export default function PodiumModal({ scores = [], isHost, onPlayAgain }) {
  useEffect(() => {
    // Launch celebratory confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px'
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          textAlign: 'center',
          border: '1.5px solid var(--accent-amber)',
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.25)'
        }}
      >
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '50%', marginBottom: '12px' }}>
          <Trophy size={42} style={{ color: 'var(--accent-amber)' }} />
        </div>

        <h2 style={{ fontSize: '2.2rem', color: 'white', marginBottom: '4px' }}>
          Game Over!
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Congratulations to our champion!
        </p>

        {/* Podium Graphics */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '28px',
            minHeight: '180px'
          }}
        >
          {/* 2nd Place */}
          {second && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <AvatarSvg avatar={second.avatar} size={46} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '6px', color: '#cbd5e1' }}>
                {second.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{second.score} pts</span>
              <div
                style={{
                  width: '100%',
                  height: '70px',
                  background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '8px',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}
              >
                2nd
              </div>
            </div>
          )}

          {/* 1st Place Winner */}
          {winner && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2 }}>
              <Trophy size={20} style={{ color: '#f59e0b', marginBottom: '2px' }} />
              <AvatarSvg avatar={winner.avatar} size={58} />
              <span style={{ fontSize: '1rem', fontWeight: 800, marginTop: '6px', color: '#f59e0b' }}>
                {winner.name}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 700 }}>{winner.score} pts</span>
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '8px',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
                }}
              >
                1st 🏆
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <AvatarSvg avatar={third.avatar} size={46} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '6px', color: '#b45309' }}>
                {third.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{third.score} pts</span>
              <div
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'linear-gradient(180deg, #d97706 0%, #78350f 100%)',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '8px',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}
              >
                3rd
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {isHost ? (
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
          >
            <RotateCcw size={18} /> Play Again
          </button>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Waiting for host to restart game...
          </p>
        )}
      </div>
    </div>
  );
}

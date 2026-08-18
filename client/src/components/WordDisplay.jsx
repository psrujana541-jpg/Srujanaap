import React from 'react';

export default function WordDisplay({ maskedWord = '', isDrawer, drawerWord, gameState, revealedWord }) {
  const isRoundOver = gameState === 'ROUND_END' || gameState === 'GAME_END';
  const displayWord = revealedWord || (isRoundOver ? maskedWord : '');

  if (isRoundOver && displayWord) {
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          THE WORD WAS
        </span>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '3px', marginTop: '2px' }}>
          {displayWord.toUpperCase()}
        </div>
      </div>
    );
  }

  if (isDrawer && drawerWord) {
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          YOUR WORD TO DRAW
        </span>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-amber)', letterSpacing: '2px' }}>
          {drawerWord}
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        GUESS THE WORD ({maskedWord.replace(/ /g, '').length} LETTERS)
      </span>
      <div 
        style={{ 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          color: 'white', 
          letterSpacing: '8px', 
          fontFamily: 'monospace',
          marginTop: '2px'
        }}
      >
        {maskedWord || '_ _ _ _'}
      </div>
    </div>
  );
}


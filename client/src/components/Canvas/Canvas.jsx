import React, { useEffect, useRef } from 'react';
import { socket } from '../../socket';
import { useSocket } from '../../hooks/useSocket';
import EVENTS from '../../events';

export default function Canvas({
  canvasRef,
  isDrawer,
  gameState,
  drawerName,
  color,
  brushSize,
  tool,
  getNormalizedPos,
  drawStroke,
  clearCanvas,
  fillCanvas,
  syncHistory
}) {
  const isMouseDownRef = useRef(false);
  const lastNormPosRef = useRef(null);

  // Initialize white canvas background & sync resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set fixed high resolution for sharp canvas
    canvas.width = 900;
    canvas.height = 600;

    clearCanvas();

    // Fetch initial canvas state when joining mid-turn
    socket.on(EVENTS.CANVAS_SYNC, (history) => {
      syncHistory(history);
    });

    return () => {
      socket.off(EVENTS.CANVAS_SYNC);
    };
  }, [canvasRef, clearCanvas, syncHistory]);

  // Listen to remote stroke events
  useSocket(EVENTS.DRAW_STROKE, (strokeData) => {
    if (!isDrawer) {
      drawStroke(strokeData);
    }
  });

  // Listen to remote clear events
  useSocket(EVENTS.CLEAR_CANVAS, () => {
    clearCanvas();
  });

  // Listen to remote fill events
  useSocket(EVENTS.FILL_CANVAS, ({ color: fillColor }) => {
    fillCanvas(fillColor);
  });

  const handlePointerDown = (e) => {
    if (!isDrawer || gameState !== 'DRAWING' || tool === 'fill') return;
    isMouseDownRef.current = true;
    const normPos = getNormalizedPos(e);
    lastNormPosRef.current = normPos;
  };

  const handlePointerMove = (e) => {
    if (!isDrawer || !isMouseDownRef.current || gameState !== 'DRAWING' || tool === 'fill') return;

    const currentNormPos = getNormalizedPos(e);
    if (!lastNormPosRef.current) {
      lastNormPosRef.current = currentNormPos;
      return;
    }

    const strokeData = {
      type: 'stroke',
      from: lastNormPosRef.current,
      to: currentNormPos,
      color,
      size: brushSize,
      tool
    };

    // Draw locally immediately
    drawStroke(strokeData);

    // Emit to server for broadcasting
    socket.emit(EVENTS.DRAW_STROKE, strokeData);

    lastNormPosRef.current = currentNormPos;
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
    lastNormPosRef.current = null;
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '66.66%', // 3:2 aspect ratio
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        touchAction: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: isDrawer && gameState === 'DRAWING' ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default'
        }}
      />

      {/* Overlay Banner for Game States */}
      {gameState === 'WORD_SELECTION' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 10
          }}
        >
          <div className="animate-float" style={{ fontSize: '3rem', marginBottom: '12px' }}>✏️</div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-amber)', marginBottom: '8px' }}>
            {isDrawer ? 'Pick a word to draw!' : `${drawerName || 'Drawer'} is choosing a word...`}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Get ready to guess!</p>
        </div>
      )}

      {gameState === 'ROUND_END' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 10
          }}
        >
          <h2 style={{ fontSize: '2.2rem', color: 'var(--accent-emerald)', marginBottom: '12px' }}>
            Round Over!
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Next turn starting soon...</p>
        </div>
      )}
    </div>
  );
}

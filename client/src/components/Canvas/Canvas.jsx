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
  getCanvasPos,
  drawStroke,
  clearCanvas,
  floodFill,
  syncHistory,
  // Team mode props
  teamMode,
  myTeam,
  drawerTeam,
  currentPhase,
}) {
  const isPointerDownRef = useRef(false);
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

  // Listen to remote fill events — runs the same flood-fill on each client
  useSocket(EVENTS.FILL_CANVAS, ({ x, y, color: fillColor }) => {
    if (!isDrawer) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // x, y are normalized (0-1); convert to canvas pixels with safety fallback
      const px = (x !== undefined && !isNaN(x)) ? x * canvas.width : canvas.width / 2;
      const py = (y !== undefined && !isNaN(y)) ? y * canvas.height : canvas.height / 2;
      floodFill(px, py, fillColor);
    }
  });

  // Listen to phase change in team mode — load canvas snapshot for opposing team
  useSocket(EVENTS.PHASE_CHANGE, ({ phase, canvasSnapshot }) => {
    if (phase === 2 && canvasSnapshot) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = canvasSnapshot;
    }
  });

  // Determine if the current user can draw right now
  const canDraw = isDrawer && gameState === 'DRAWING' && (
    !teamMode || currentPhase === 1
  );

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!canDraw) return;

    // Capture pointer so move events continue even if cursor leaves canvas
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if browser doesn't support pointer capture on specific touch
    }
    isPointerDownRef.current = true;

    const normPos = getNormalizedPos(e);

    if (tool === 'fill') {
      // Flood-fill at clicked position
      const canvas = canvasRef.current;
      if (!canvas) return;
      const pixelPos = getCanvasPos(normPos);
      floodFill(pixelPos.x, pixelPos.y, color);
      // Broadcast fill action to server
      socket.emit(EVENTS.FILL_CANVAS, { x: normPos.x, y: normPos.y, color });
    } else {
      lastNormPosRef.current = normPos;
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    if (!canDraw || !isPointerDownRef.current || tool === 'fill') return;

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

  const handlePointerUp = (e) => {
    isPointerDownRef.current = false;
    lastNormPosRef.current = null;
  };

  // Determine cursor style based on tool
  const getCursor = () => {
    if (!canDraw) return 'default';
    if (tool === 'fill') return 'crosshair';
    if (tool === 'eraser') return 'cell';
    return 'crosshair';
  };

  // Determine if the opposing team should see a waiting overlay (Phase 1)
  const showTeamWaitingOverlay = teamMode && gameState === 'DRAWING' &&
    currentPhase === 1 && !isDrawer && myTeam !== drawerTeam && myTeam != null;

  // During Phase 2 in team mode, the canvas is visible to all (readonly for drawing team)
  const showPhase2Banner = teamMode && gameState === 'TEAM_PHASE2';

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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: getCursor(),
          touchAction: 'none'
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

      {/* Team Mode Phase 1 Waiting Overlay for opposing team */}
      {showTeamWaitingOverlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 10,
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '3.5rem' }}>🙈</div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-amber)' }}>
            {drawerTeam === 'A' ? 'Team A' : 'Team B'} is drawing secretly!
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '280px' }}>
            You'll get to see the drawing and guess in <strong style={{ color: 'white' }}>Phase 2</strong>.
          </p>
          <div
            style={{
              marginTop: '8px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid var(--accent-indigo)',
              fontSize: '0.9rem',
              color: 'var(--accent-indigo)',
              fontWeight: 600
            }}
          >
            ⏳ Phase 1 in progress...
          </div>
        </div>
      )}

      {/* Team Phase 2 Banner */}
      {showPhase2Banner && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '8px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
            textAlign: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.95rem',
            zIndex: 5
          }}
        >
          🔍 Phase 2 — Guess the drawing!
        </div>
      )}
    </div>
  );
}

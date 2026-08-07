import React, { useState, useEffect } from 'react';
import { Copy, Check, LogOut, Play, Share2 } from 'lucide-react';
import { socket } from '../socket';
import { useSocket } from '../hooks/useSocket';
import { useCanvas } from '../hooks/useCanvas';
import EVENTS from '../events';

import Canvas from '../components/Canvas/Canvas';
import Toolbar from '../components/Canvas/Toolbar';
import ChatBox from '../components/Chat/ChatBox';
import ChatInput from '../components/Chat/ChatInput';
import PlayerList from '../components/PlayerList';
import Timer from '../components/Timer';
import WordDisplay from '../components/WordDisplay';
import WordSelectModal from '../components/WordSelectModal';
import PodiumModal from '../components/PodiumModal';

export default function GameRoom({ initialRoom, initialPlayer, onLeave }) {
  const [room, setRoom] = useState(initialRoom);
  const [myPlayer, setMyPlayer] = useState(initialPlayer);
  const [messages, setMessages] = useState([]);
  const [closeHint, setCloseHint] = useState(null);

  // Drawer specific state
  const [wordChoices, setWordChoices] = useState([]);
  const [myDrawerWord, setMyDrawerWord] = useState('');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(initialRoom.timeLeft || 0);

  // Copy share link status
  const [copied, setCopied] = useState(false);

  // Canvas hook
  const {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    getNormalizedPos,
    drawStroke,
    clearCanvas,
    fillCanvas,
    syncHistory
  } = useCanvas();

  const isHost = room.hostId === myPlayer.id;
  const isDrawer = room.drawerId === myPlayer.id;

  // Listen to room updates
  useSocket(EVENTS.ROOM_UPDATE, (updatedRoom) => {
    setRoom(updatedRoom);
    // Update my player state if exists
    const updatedMe = updatedRoom.players.find(p => p.id === socket.id);
    if (updatedMe) {
      setMyPlayer(updatedMe);
    }
  });

  // Listen to timer updates
  useSocket(EVENTS.TIMER_UPDATE, ({ timeLeft: time }) => {
    setTimeLeft(time);
  });

  // Listen to chat messages
  useSocket(EVENTS.CHAT_MESSAGE, (msg) => {
    setMessages(prev => [...prev, msg]);
  });

  // Listen to close guess hints
  useSocket(EVENTS.CLOSE_GUESS_HINT, ({ message }) => {
    setCloseHint(message);
    setTimeout(() => setCloseHint(null), 4000);
  });

  // Listen to word choices for drawer
  useSocket(EVENTS.WORD_CHOICES, ({ words }) => {
    setWordChoices(words);
  });

  // Listen to round start
  useSocket(EVENTS.ROUND_START, () => {
    setWordChoices([]);
  });

  // Listen to word selected by drawer
  useSocket(EVENTS.WORD_SELECTED, ({ word }) => {
    setMyDrawerWord(word);
  });

  // Handle drawer selecting word
  const handleSelectWord = (word) => {
    socket.emit(EVENTS.WORD_SELECTED, { word });
    setWordChoices([]);
  };

  // Handle host starting game
  const handleStartGame = () => {
    socket.emit(EVENTS.START_GAME);
  };

  // Handle sending chat / guess
  const handleSendMessage = (text) => {
    socket.emit(EVENTS.CHAT_MESSAGE, { message: text });
  };

  // Handle host play again
  const handlePlayAgain = () => {
    socket.emit(EVENTS.PLAY_AGAIN);
  };

  // Copy Room Code / Share link
  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    socket.emit(EVENTS.LEAVE_ROOM);
    onLeave();
  };

  const currentDrawerObj = room.players.find(p => p.id === room.drawerId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px 24px' }}>
      {/* Game Header */}
      <header
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✏️ Drawlulu</span>
          </div>

          {/* Room Code Badge */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            title="Click to copy room code"
          >
            Code: <strong style={{ color: 'var(--accent-amber)', letterSpacing: '1px' }}>{room.code}</strong>
            {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
          </button>
        </div>

        {/* Word / Round Info */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {room.gameState !== 'LOBBY' && (
            <WordDisplay 
              maskedWord={room.maskedWord} 
              isDrawer={isDrawer} 
              drawerWord={myDrawerWord} 
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Round Counter */}
          {room.gameState !== 'LOBBY' && (
            <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              ROUND <span style={{ fontWeight: 700, color: 'white' }}>{room.currentRound}</span> / {room.totalRounds}
            </div>
          )}

          {/* Timer */}
          {room.gameState !== 'LOBBY' && (
            <Timer timeLeft={timeLeft} totalTime={room.roundTime} />
          )}

          {/* Leave Button */}
          <button
            type="button"
            onClick={handleLeaveRoom}
            className="btn-secondary"
            style={{ padding: '8px 12px', color: '#ef4444' }}
            title="Leave Game"
          >
            <LogOut size={16} /> Exit
          </button>
        </div>
      </header>

      {/* Main Gameplay Layout */}
      <div 
        style={{ 
          flex: 1, 
          display: 'grid', 
          gridTemplateColumns: '260px 1fr 300px', 
          gap: '16px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Scoreboard */}
        <div className="glass-card" style={{ padding: '16px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>PLAYERS ({room.players.length}/{room.maxPlayers})</span>
          </h3>
          <PlayerList players={room.players} drawerId={room.drawerId} myId={myPlayer.id} />
        </div>

        {/* Middle Column: Canvas & Drawer Controls */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Canvas
            canvasRef={canvasRef}
            isDrawer={isDrawer}
            gameState={room.gameState}
            drawerName={currentDrawerObj?.name}
            color={color}
            brushSize={brushSize}
            tool={tool}
            getNormalizedPos={getNormalizedPos}
            drawStroke={drawStroke}
            clearCanvas={clearCanvas}
            fillCanvas={fillCanvas}
            syncHistory={syncHistory}
          />

          {/* Toolbar visible only to current drawer */}
          <Toolbar
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            tool={tool}
            setTool={setTool}
            onClear={() => {
              clearCanvas();
              socket.emit(EVENTS.CLEAR_CANVAS);
            }}
            onFill={(fillColor) => {
              fillCanvas(fillColor);
              socket.emit(EVENTS.FILL_CANVAS, { color: fillColor });
            }}
            disabled={!isDrawer || room.gameState !== 'DRAWING'}
          />
        </div>

        {/* Right Column: Chat & Guesses */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', fontWeight: 700, fontSize: '0.95rem' }}>
            Chat & Guesses
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ChatBox messages={messages} closeHint={closeHint} />
          </div>
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isDrawer || myPlayer.hasGuessed || room.gameState !== 'DRAWING'}
            placeholder={
              isDrawer 
                ? 'You are drawing!' 
                : myPlayer.hasGuessed 
                ? 'You guessed correctly!' 
                : 'Type your guess...'
            }
          />
        </div>
      </div>

      {/* Lobby Overlay Screen */}
      {room.gameState === 'LOBBY' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 80
          }}
        >
          <div className="glass-card animate-fade-in" style={{ width: '90%', maxWidth: '480px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '8px' }}>
              Game Lobby
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Share the code below with friends to join!
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '2px dashed var(--accent-indigo)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '6px',
                color: 'var(--accent-amber)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <span>{room.code}</span>
              <button type="button" onClick={handleCopyCode} className="btn-secondary" style={{ padding: '8px' }}>
                {copied ? <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={18} />}
              </button>
            </div>

            <div style={{ marginBottom: '24px', textAlign: 'left', background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                PLAYERS IN LOBBY ({room.players.length}/{room.maxPlayers}):
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {room.players.map(p => (
                  <span key={p.id} style={{ background: 'rgba(99,102,241,0.2)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {p.name} {p.isHost && '👑'}
                  </span>
                ))}
              </div>
            </div>

            {isHost ? (
              <button
                type="button"
                onClick={handleStartGame}
                disabled={room.players.length < 2}
                className="btn-emerald"
                style={{ width: '100%', padding: '14px', fontSize: '1.1rem', opacity: room.players.length < 2 ? 0.6 : 1 }}
              >
                <Play size={20} /> {room.players.length < 2 ? 'Waiting for 1 more player...' : 'Start Game'}
              </button>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Waiting for the host to start the game...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Word Selection Modal for Drawer */}
      {room.gameState === 'WORD_SELECTION' && isDrawer && wordChoices.length > 0 && (
        <WordSelectModal words={wordChoices} onSelectWord={handleSelectWord} timeLeft={timeLeft} />
      )}

      {/* Game End Podium Modal */}
      {room.gameState === 'GAME_END' && (
        <PodiumModal scores={room.players} isHost={isHost} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Play, Users, PlusCircle, LogIn, Sparkles, Clock, RotateCcw } from 'lucide-react';
import AvatarPicker from '../components/AvatarPicker';
import { socket } from '../socket';
import EVENTS from '../events';

export default function Home({ onJoinedRoom }) {
  const [playerName, setPlayerName] = useState('');
  const [avatar, setAvatar] = useState({
    color: '#6366f1',
    eyes: 1,
    mouth: 1
  });
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [roomCodeInput, setRoomCodeInput] = useState('');
  
  // Settings for creating room
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [roundTime, setRoundTime] = useState(80);
  const [totalRounds, setTotalRounds] = useState(3);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your nickname');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    socket.emit(
      EVENTS.CREATE_ROOM,
      {
        playerName: playerName.trim(),
        avatar,
        options: { maxPlayers, roundTime, totalRounds }
      },
      (res) => {
        setIsLoading(false);
        if (res.success) {
          onJoinedRoom(res.room, res.player);
        } else {
          setErrorMsg(res.error || 'Failed to create room');
        }
      }
    );
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your nickname');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMsg('Please enter a room code');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    socket.emit(
      EVENTS.JOIN_ROOM,
      {
        playerName: playerName.trim(),
        avatar,
        roomCode: roomCodeInput.trim().toUpperCase()
      },
      (res) => {
        setIsLoading(false);
        if (res.success) {
          onJoinedRoom(res.room, res.player);
        } else {
          setErrorMsg(res.error || 'Failed to join room');
        }
      }
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Hero Branding */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div 
          className="animate-float"
          style={{ 
            fontSize: '3.5rem', 
            display: 'inline-block',
            filter: 'drop-shadow(0 8px 16px rgba(99, 102, 241, 0.4))'
          }}
        >
          ✏️🎨
        </div>
        <h1
          style={{
            fontSize: '3.2rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: '4px'
          }}
        >
          Drawlulu.io
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px' }}>
          Real-Time Multiplayer Drawing & Guessing Fun
        </p>
      </div>

      {/* Main Glass Card */}
      <div
        className="glass-card glass-glow animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '32px'
        }}
      >
        {/* Avatar Selection */}
        <div style={{ marginBottom: '24px' }}>
          <AvatarPicker avatar={avatar} onChange={setAvatar} />
        </div>

        {/* Player Name Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            YOUR NICKNAME
          </label>
          <input
            type="text"
            placeholder="Enter your name..."
            maxLength={16}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Mode Toggle Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => setMode('create')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'create' ? 'var(--accent-indigo)' : 'transparent',
              color: mode === 'create' ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <PlusCircle size={16} /> Create Room
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'join' ? 'var(--accent-indigo)' : 'transparent',
              color: mode === 'join' ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={16} /> Join Room
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderLeft: '4px solid #ef4444',
              color: '#fca5a5',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              marginBottom: '16px'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Mode Forms */}
        {mode === 'create' ? (
          <form onSubmit={handleCreateRoom}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                  PLAYERS
                </label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="input-field"
                  style={{ padding: '8px' }}
                >
                  <option value={4}>4 Players</option>
                  <option value={6}>6 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={12}>12 Players</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                  DRAW TIMER
                </label>
                <select
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="input-field"
                  style={{ padding: '8px' }}
                >
                  <option value={45}>45 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={80}>80 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                  ROUNDS
                </label>
                <select
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="input-field"
                  style={{ padding: '8px' }}
                >
                  <option value={2}>2 Rounds</option>
                  <option value={3}>3 Rounds</option>
                  <option value={5}>5 Rounds</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
            >
              <Sparkles size={20} /> {isLoading ? 'Creating...' : 'Create & Play'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ROOM CODE
              </label>
              <input
                type="text"
                placeholder="Enter 6-letter room code (e.g. ABCDEF)"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                className="input-field"
                style={{ letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700 }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-emerald"
              style={{ width: '100%', padding: '14px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}
            >
              <Play size={20} /> {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

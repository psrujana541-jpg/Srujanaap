import React, { useState } from 'react';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';

export default function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const handleJoinedRoom = (room, player) => {
    setCurrentRoom(room);
    setCurrentPlayer(player);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setCurrentPlayer(null);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw' }}>
      {!currentRoom ? (
        <Home onJoinedRoom={handleJoinedRoom} />
      ) : (
        <GameRoom
          initialRoom={currentRoom}
          initialPlayer={currentPlayer}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}

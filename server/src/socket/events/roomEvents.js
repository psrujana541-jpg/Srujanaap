const gameManager = require('../../game/GameManager');
const Player = require('../../game/Player');
const EVENTS = require('../../../../shared/events');

module.exports = function registerRoomEvents(io, socket) {
  socket.on(EVENTS.CREATE_ROOM, ({ playerName, avatar, options }, callback) => {
    try {
      const player = new Player(socket.id, playerName, avatar, true);
      const room = gameManager.createRoom(player, options);
      room.setIO(io);
      
      socket.join(room.code);

      if (typeof callback === 'function') {
        callback({ success: true, room: room.getPublicState(), player: player.toJSON() });
      }
    } catch (err) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  socket.on(EVENTS.JOIN_ROOM, ({ roomCode, playerName, avatar }, callback) => {
    try {
      const code = (roomCode || '').toUpperCase().trim();
      const room = gameManager.getRoom(code);
      if (!room) {
        if (typeof callback === 'function') {
          return callback({ success: false, error: 'Room not found' });
        }
        return;
      }

      if (room.players.size >= room.maxPlayers) {
        if (typeof callback === 'function') {
          return callback({ success: false, error: 'Room is full' });
        }
        return;
      }

      const player = new Player(socket.id, playerName, avatar, false);
      gameManager.joinRoom(code, player);
      room.setIO(io);

      socket.join(room.code);

      if (typeof callback === 'function') {
        callback({ success: true, room: room.getPublicState(), player: player.toJSON() });
      }
    } catch (err) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  socket.on(EVENTS.LEAVE_ROOM, () => {
    const room = gameManager.leaveRoom(socket.id);
    if (room) {
      socket.leave(room.code);
    }
  });

  socket.on(EVENTS.UPDATE_SETTINGS, ({ roomCode, settings }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      room.updateSettings(settings);
    }
  });
};

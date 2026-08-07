const registerRoomEvents = require('./events/roomEvents');
const registerDrawEvents = require('./events/drawEvents');
const registerChatEvents = require('./events/chatEvents');
const registerGameEvents = require('./events/gameEvents');
const gameManager = require('../game/GameManager');

module.exports = function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}`);

    registerRoomEvents(io, socket);
    registerDrawEvents(io, socket);
    registerChatEvents(io, socket);
    registerGameEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
      gameManager.leaveRoom(socket.id);
    });
  });
};

const gameManager = require('../../game/GameManager');
const EVENTS = require('../../../../shared/events');

module.exports = function registerGameEvents(io, socket) {
  socket.on(EVENTS.START_GAME, () => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room) return;

    if (room.hostId !== socket.id) {
      socket.emit(EVENTS.ERROR, { message: 'Only the host can start the game' });
      return;
    }

    try {
      room.startGame();
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });

  socket.on(EVENTS.WORD_SELECTED, ({ word }) => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room) return;

    if (room.drawerId !== socket.id) return;

    room.selectWord(word);
  });

  socket.on(EVENTS.PLAY_AGAIN, () => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room) return;

    if (room.hostId !== socket.id) return;

    room.resetToLobby();
  });
};

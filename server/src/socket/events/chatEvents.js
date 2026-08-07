const gameManager = require('../../game/GameManager');
const EVENTS = require('../../../../shared/events');

module.exports = function registerChatEvents(io, socket) {
  socket.on(EVENTS.CHAT_MESSAGE, ({ message }) => {
    if (!message || typeof message !== 'string' || message.trim() === '') return;

    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    const trimmedMsg = message.trim();

    // Check if message is a guess during drawing state
    if (room.gameState === 'DRAWING') {
      const res = room.checkGuess(socket.id, trimmedMsg);

      if (res.isGuess) {
        if (res.correct) {
          // Correct guess! System message broadcast (without revealing exact word to others)
          io.to(room.code).emit(EVENTS.CHAT_MESSAGE, {
            id: 'msg_' + Date.now() + '_' + Math.random(),
            sender: 'System',
            message: `${player.name} guessed the word! (+${res.points} pts)`,
            isSystem: true,
            type: 'correct'
          });
          return;
        }

        if (res.alreadyGuessed) {
          // If already guessed, send private chat message so they can talk to other successful guessers
          // or just emit system notification to them
          socket.emit(EVENTS.CHAT_MESSAGE, {
            id: 'msg_' + Date.now(),
            sender: 'System',
            message: 'You have already guessed the word for this round!',
            isSystem: true,
            type: 'info'
          });
          return;
        }
      }
    }

    // Normal chat message
    io.to(room.code).emit(EVENTS.CHAT_MESSAGE, {
      id: 'msg_' + Date.now() + '_' + Math.random(),
      sender: player.name,
      senderId: player.id,
      message: trimmedMsg,
      isSystem: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });
};

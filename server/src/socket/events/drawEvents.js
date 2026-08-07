const gameManager = require('../../game/GameManager');
const EVENTS = require('../../../../shared/events');

module.exports = function registerDrawEvents(io, socket) {
  socket.on(EVENTS.DRAW_STROKE, (strokeData) => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room || room.drawerId !== socket.id) return; // Only drawer can draw

    room.handleStroke(strokeData);
    socket.to(room.code).emit(EVENTS.DRAW_STROKE, strokeData);
  });

  socket.on(EVENTS.CLEAR_CANVAS, () => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room || room.drawerId !== socket.id) return;

    room.clearCanvas();
    io.to(room.code).emit(EVENTS.CLEAR_CANVAS);
  });

  socket.on(EVENTS.FILL_CANVAS, ({ color }) => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room || room.drawerId !== socket.id) return;

    const fillData = { type: 'fill', color };
    room.handleStroke(fillData);
    io.to(room.code).emit(EVENTS.FILL_CANVAS, fillData);
  });
};

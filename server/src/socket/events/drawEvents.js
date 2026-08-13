const gameManager = require('../../game/GameManager');
const EVENTS = require('../../../../shared/events');

module.exports = function registerDrawEvents(io, socket) {
  socket.on(EVENTS.DRAW_STROKE, (strokeData) => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room || room.drawerId !== socket.id) return; // Only drawer can draw

    // In team mode Phase 2, no further drawing allowed
    if (room.teamMode && room.currentPhase === 2) return;

    room.handleStroke(strokeData);

    // In team mode Phase 1, only broadcast to the drawer's team (not opposing team)
    if (room.teamMode && room.currentPhase === 1) {
      const drawerPlayer = room.players.get(socket.id);
      if (!drawerPlayer) return;
      const drawerTeam = drawerPlayer.team;

      // Emit only to same-team players (excludes the drawer themselves via socket.to)
      room.players.forEach((player) => {
        if (player.id !== socket.id && player.team === drawerTeam) {
          io.to(player.id).emit(EVENTS.DRAW_STROKE, strokeData);
        }
      });
    } else {
      // Normal mode or team mode spectators — broadcast to entire room except sender
      socket.to(room.code).emit(EVENTS.DRAW_STROKE, strokeData);
    }
  });

  socket.on(EVENTS.CLEAR_CANVAS, () => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room || room.drawerId !== socket.id) return;
    if (room.teamMode && room.currentPhase === 2) return;

    room.clearCanvas();
    io.to(room.code).emit(EVENTS.CLEAR_CANVAS);
  });

  /**
   * FILL_CANVAS — receives {x, y, color} where x/y are normalized (0–1) coordinates.
   * The BFS flood-fill runs deterministically on each client using the same starting point.
   */
  socket.on(EVENTS.FILL_CANVAS, ({ x, y, color }) => {
    const room = gameManager.getRoomByPlayerId(socket.id);
    if (!room || room.drawerId !== socket.id) return;
    if (room.teamMode && room.currentPhase === 2) return;

    const fillData = { type: 'fill', x, y, color };
    room.handleStroke(fillData);

    // In team mode Phase 1, only broadcast to same team
    if (room.teamMode && room.currentPhase === 1) {
      const drawerPlayer = room.players.get(socket.id);
      if (!drawerPlayer) return;
      const drawerTeam = drawerPlayer.team;

      room.players.forEach((player) => {
        if (player.id !== socket.id && player.team === drawerTeam) {
          io.to(player.id).emit(EVENTS.FILL_CANVAS, fillData);
        }
      });
    } else {
      io.to(room.code).emit(EVENTS.FILL_CANVAS, fillData);
    }
  });
};

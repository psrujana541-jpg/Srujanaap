// Shared Socket.IO Event Constants

module.exports = {
  // Room Events
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  ROOM_UPDATE: 'room-update',
  LEAVE_ROOM: 'leave-room',
  UPDATE_SETTINGS: 'update-settings',

  // Game Lifecycle Events
  START_GAME: 'start-game',
  WORD_CHOICES: 'word-choices',
  WORD_SELECTED: 'word-selected',
  ROUND_START: 'round-start',
  ROUND_END: 'round-end',
  GAME_END: 'game-end',
  PLAY_AGAIN: 'play-again',

  // Drawing Events
  DRAW_STROKE: 'draw-stroke',
  CLEAR_CANVAS: 'clear-canvas',
  FILL_CANVAS: 'fill-canvas',
  UNDO_STROKE: 'undo-stroke',
  CANVAS_SYNC: 'canvas-sync',

  // Chat & Guess Events
  CHAT_MESSAGE: 'chat-message',
  GUESS_RESULT: 'guess-result',
  CLOSE_GUESS_HINT: 'close-guess-hint',

  // System Events
  ERROR: 'error',
  TIMER_UPDATE: 'timer-update'
};

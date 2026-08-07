// ES Module event constants for Vite client

export const CREATE_ROOM = 'create-room';
export const JOIN_ROOM = 'join-room';
export const ROOM_UPDATE = 'room-update';
export const LEAVE_ROOM = 'leave-room';
export const UPDATE_SETTINGS = 'update-settings';

export const START_GAME = 'start-game';
export const WORD_CHOICES = 'word-choices';
export const WORD_SELECTED = 'word-selected';
export const ROUND_START = 'round-start';
export const ROUND_END = 'round-end';
export const GAME_END = 'game-end';
export const PLAY_AGAIN = 'play-again';

export const DRAW_STROKE = 'draw-stroke';
export const CLEAR_CANVAS = 'clear-canvas';
export const FILL_CANVAS = 'fill-canvas';
export const UNDO_STROKE = 'undo-stroke';
export const CANVAS_SYNC = 'canvas-sync';

export const CHAT_MESSAGE = 'chat-message';
export const GUESS_RESULT = 'guess-result';
export const CLOSE_GUESS_HINT = 'close-guess-hint';

export const ERROR = 'error';
export const TIMER_UPDATE = 'timer-update';

const EVENTS = {
  CREATE_ROOM,
  JOIN_ROOM,
  ROOM_UPDATE,
  LEAVE_ROOM,
  UPDATE_SETTINGS,
  START_GAME,
  WORD_CHOICES,
  WORD_SELECTED,
  ROUND_START,
  ROUND_END,
  GAME_END,
  PLAY_AGAIN,
  DRAW_STROKE,
  CLEAR_CANVAS,
  FILL_CANVAS,
  UNDO_STROKE,
  CANVAS_SYNC,
  CHAT_MESSAGE,
  GUESS_RESULT,
  CLOSE_GUESS_HINT,
  ERROR,
  TIMER_UPDATE
};

export default EVENTS;

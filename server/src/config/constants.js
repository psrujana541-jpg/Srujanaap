module.exports = {
  DEFAULT_MAX_PLAYERS: 8,
  DEFAULT_ROUND_TIME: 80, // seconds
  DEFAULT_TOTAL_ROUNDS: 3,
  WORD_SELECTION_TIME: 15, // seconds for drawer to pick a word
  ROUND_INTERMISSION_TIME: 4, // seconds between rounds
  WORD_CHOICES_COUNT: 3,

  // Scoring
  MAX_GUESS_POINTS: 500,
  MIN_GUESS_POINTS: 100,
  DRAWER_BONUS_PER_GUESS: 50,

  // Game States
  GAME_STATES: {
    LOBBY: 'LOBBY',
    WORD_SELECTION: 'WORD_SELECTION',
    DRAWING: 'DRAWING',
    ROUND_END: 'ROUND_END',
    GAME_END: 'GAME_END'
  }
};

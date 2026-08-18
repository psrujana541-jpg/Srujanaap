const { 
  DEFAULT_MAX_PLAYERS, 
  DEFAULT_ROUND_TIME, 
  DEFAULT_TOTAL_ROUNDS, 
  WORD_SELECTION_TIME,
  ROUND_INTERMISSION_TIME,
  MAX_GUESS_POINTS,
  MIN_GUESS_POINTS,
  DRAWER_BONUS_PER_GUESS,
  GAME_STATES 
} = require('../config/constants');
const { getRandomWords } = require('./wordList');
const EVENTS = require('../../../shared/events');

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

class Room {
  constructor(code, hostPlayer, options = {}) {
    this.code = code;
    this.hostId = hostPlayer.id;
    this.players = new Map(); // socketId -> Player
    this.players.set(hostPlayer.id, hostPlayer);
    
    // Settings
    this.maxPlayers = options.maxPlayers || DEFAULT_MAX_PLAYERS;
    this.roundTime = options.roundTime || DEFAULT_ROUND_TIME;
    this.totalRounds = options.totalRounds || DEFAULT_TOTAL_ROUNDS;

    // Game state variables
    this.gameState = GAME_STATES.LOBBY;
    this.currentRound = 0;
    this.turnOrder = []; // Array of socketIds
    this.currentTurnIndex = -1;
    this.drawerId = null;
    this.currentWord = null;
    this.wordChoices = [];
    this.usedWords = new Set();
    this.revealedIndices = new Set(); // Indices of word characters revealed as hint

    // Drawing state
    this.canvasHistory = [];

    // Timing
    this.timer = null;
    this.timeLeft = 0;
    this.turnStartTime = null;

    // Callbacks provided by GameManager / Socket layer
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  addPlayer(player) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Room is full');
    }
    this.players.set(player.id, player);
    if (this.turnOrder.length > 0 && !this.turnOrder.includes(player.id)) {
      this.turnOrder.push(player.id);
    }
    this.broadcastRoomUpdate();
    
    // If drawing in progress, sync canvas history to new player
    if (this.io && this.canvasHistory.length > 0) {
      this.io.to(player.id).emit(EVENTS.CANVAS_SYNC, this.canvasHistory);
    }
  }

  removePlayer(socketId) {
    const isHost = this.hostId === socketId;
    const isCurrentDrawer = this.drawerId === socketId;

    this.players.delete(socketId);
    this.turnOrder = this.turnOrder.filter(id => id !== socketId);

    // Reassign host if needed
    if (isHost && this.players.size > 0) {
      const nextHost = this.players.values().next().value;
      this.hostId = nextHost.id;
      nextHost.isHost = true;
    }

    // Handle mid-game departure
    if (this.gameState !== GAME_STATES.LOBBY && this.players.size < 2) {
      this.clearTimer();
      this.gameState = GAME_STATES.LOBBY;
      this.currentRound = 0;
      this.currentTurnIndex = -1;
      this.drawerId = null;
      this.currentWord = null;
      this.canvasHistory = [];
    } else if (isCurrentDrawer && (this.gameState === GAME_STATES.DRAWING || this.gameState === GAME_STATES.WORD_SELECTION)) {
      this.clearTimer();
      this.broadcastSystemMessage(`Drawer disconnected! Skipping turn...`);
      this.endRound('Drawer left');
    } else if (this.gameState === GAME_STATES.DRAWING) {
      this.checkAllGuessed();
    }

    this.broadcastRoomUpdate();
  }

  updateSettings(settings) {
    if (this.gameState !== GAME_STATES.LOBBY) return;
    if (settings.maxPlayers) this.maxPlayers = Math.min(Math.max(settings.maxPlayers, 2), 30);
    if (settings.roundTime) this.roundTime = Math.min(Math.max(settings.roundTime, 30), 180);
    if (settings.totalRounds) this.totalRounds = Math.min(Math.max(settings.totalRounds, 1), 10);
    this.broadcastRoomUpdate();
  }

  startGame() {
    if (this.players.size < 2) {
      throw new Error('At least 2 players are required to start the game');
    }
    this.currentRound = 1;
    this.turnOrder = Array.from(this.players.keys()).sort(() => 0.5 - Math.random());
    this.currentTurnIndex = -1;
    this.usedWords.clear();

    // Reset scores
    this.players.forEach(player => {
      player.score = 0;
      player.resetRoundState();
    });

    this.startTurn();
  }

  startTurn() {
    this.clearTimer();
    this.canvasHistory = [];
    this.revealedIndices.clear();

    // Reset round states
    this.players.forEach(p => p.resetRoundState());

    this.currentTurnIndex++;
    if (this.currentTurnIndex >= this.turnOrder.length) {
      this.currentTurnIndex = 0;
      this.currentRound++;
    }

    if (this.currentRound > this.totalRounds) {
      this.endGame();
      return;
    }

    this.drawerId = this.turnOrder[this.currentTurnIndex];
    const drawer = this.players.get(this.drawerId);
    if (!drawer) {
      // If drawer missing, skip to next turn
      this.startTurn();
      return;
    }

    drawer.isDrawer = true;
    this.gameState = GAME_STATES.WORD_SELECTION;
    this.wordChoices = getRandomWords(WORD_SELECTION_TIME > 0 ? 3 : 3, Array.from(this.usedWords));

    this.broadcastRoomUpdate();

    // Send word choices specifically to the drawer
    if (this.io) {
      this.io.to(this.drawerId).emit(EVENTS.WORD_CHOICES, { words: this.wordChoices });
      this.io.to(this.code).emit(EVENTS.CLEAR_CANVAS);
    }

    // Start timer for word selection
    this.timeLeft = WORD_SELECTION_TIME;
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.broadcastTimer();

      if (this.timeLeft <= 0) {
        // Auto-select first word if drawer fails to choose
        this.selectWord(this.wordChoices[0]);
      }
    }, 1000);
  }

  selectWord(word) {
    if (this.gameState !== GAME_STATES.WORD_SELECTION) return;
    this.clearTimer();

    this.currentWord = word.toLowerCase();
    this.usedWords.add(this.currentWord);
    this.gameState = GAME_STATES.DRAWING;
    this.turnStartTime = Date.now();

    this.broadcastRoomUpdate();

    // Notify room round started
    if (this.io) {
      this.io.to(this.code).emit(EVENTS.ROUND_START, {
        drawerId: this.drawerId,
        wordLength: this.currentWord.length,
        timeLimit: this.roundTime,
        maskedWord: this.getMaskedWord()
      });
      // Send actual word to drawer only
      this.io.to(this.drawerId).emit(EVENTS.WORD_SELECTED, { word: this.currentWord });
    }

    // Start drawing round timer
    this.timeLeft = this.roundTime;
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.broadcastTimer();

      // Progressive hint reveals at halfway and 25% remaining time
      if (this.timeLeft === Math.floor(this.roundTime / 2)) {
        this.revealHintLetter();
      } else if (this.timeLeft === Math.floor(this.roundTime / 4)) {
        this.revealHintLetter();
      }

      if (this.timeLeft <= 0) {
        this.endRound('Time limit reached!');
      }
    }, 1000);
  }

  revealHintLetter() {
    if (!this.currentWord) return;
    const unrevealed = [];
    for (let i = 0; i < this.currentWord.length; i++) {
      if (this.currentWord[i] !== ' ' && !this.revealedIndices.has(i)) {
        unrevealed.push(i);
      }
    }
    if (unrevealed.length > 1) { // Leave at least 1 character hidden
      const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      this.revealedIndices.add(randomIndex);
      if (this.io) {
        this.io.to(this.code).emit(EVENTS.ROOM_UPDATE, this.getPublicState());
      }
    }
  }

  getMaskedWord(socketId = null) {
    if (!this.currentWord) return '';
    
    // Reveal full word at round end or game end
    if (this.gameState === GAME_STATES.ROUND_END || this.gameState === GAME_STATES.GAME_END) {
      return this.currentWord;
    }

    // If drawer or user who guessed correctly, return full word
    if (socketId) {
      const player = this.players.get(socketId);
      if (player && (player.isDrawer || player.hasGuessed)) {
        return this.currentWord;
      }
    }

    return this.currentWord
      .split('')
      .map((char, index) => {
        if (char === ' ') return ' ';
        if (this.revealedIndices.has(index)) return char;
        return '_';
      })
      .join('');
  }

  checkGuess(socketId, text) {
    if (this.gameState !== GAME_STATES.DRAWING) return { isGuess: false };
    
    const player = this.players.get(socketId);
    if (!player) return { isGuess: false };

    // Drawer cannot guess
    if (player.isDrawer) return { isGuess: false };

    // Player already guessed correctly
    if (player.hasGuessed) return { isGuess: false, alreadyGuessed: true };

    const cleanGuess = text.trim().toLowerCase();
    const targetWord = this.currentWord.toLowerCase();

    // Exact match
    if (cleanGuess === targetWord) {
      player.hasGuessed = true;
      player.guessTime = Date.now();

      // Only the first correct guesser gets points
      const anyoneElseGuessed = Array.from(this.players.values()).some(
        p => p.id !== player.id && !p.isDrawer && p.hasGuessed
      );

      if (anyoneElseGuessed) {
        // Someone already guessed first — no points, treat as correct but no reward
        this.broadcastRoomUpdate();
        if (this.io) {
          this.io.to(this.code).emit(EVENTS.GUESS_RESULT, {
            playerId: player.id,
            playerName: player.name,
            correct: true,
            points: 0
          });
        }
        this.checkAllGuessed();
        return { isGuess: true, correct: true, points: 0 };
      }

      // First correct guesser — award points
      const timeFraction = this.timeLeft / this.roundTime;
      const points = Math.round(MIN_GUESS_POINTS + (MAX_GUESS_POINTS - MIN_GUESS_POINTS) * timeFraction);
      player.addScore(points);

      // Award drawer bonus
      const drawer = this.players.get(this.drawerId);
      if (drawer) {
        drawer.addScore(DRAWER_BONUS_PER_GUESS);
      }

      this.broadcastRoomUpdate();

      if (this.io) {
        this.io.to(this.code).emit(EVENTS.GUESS_RESULT, {
          playerId: player.id,
          playerName: player.name,
          correct: true,
          points
        });
      }

      // End the round immediately — first guesser wins
      this.broadcastSystemMessage(`${player.name} guessed it first! 🎉`);
      this.endRound(`${player.name} guessed first!`);
      return { isGuess: true, correct: true, points };
    }

    // Check for close guess (spelling off by 1 letter)
    const dist = levenshteinDistance(cleanGuess, targetWord);
    if (dist === 1 && cleanGuess.length >= 3) {
      if (this.io) {
        this.io.to(socketId).emit(EVENTS.CLOSE_GUESS_HINT, {
          message: `'${text}' is very close!`
        });
      }
    }

    return { isGuess: true, correct: false };
  }

  checkAllGuessed() {
    // Count non-drawers
    let nonDrawersCount = 0;
    let guessedCount = 0;

    this.players.forEach(p => {
      if (!p.isDrawer) {
        nonDrawersCount++;
        if (p.hasGuessed) guessedCount++;
      }
    });

    if (nonDrawersCount > 0 && guessedCount >= nonDrawersCount) {
      this.endRound('Everyone guessed the word!');
    }
  }

  handleStroke(strokeData) {
    if (this.gameState !== GAME_STATES.DRAWING) return;
    this.canvasHistory.push(strokeData);
  }

  clearCanvas() {
    if (this.gameState !== GAME_STATES.DRAWING) return;
    this.canvasHistory = [];
  }

  endRound(reason = '') {
    this.clearTimer();
    this.gameState = GAME_STATES.ROUND_END;

    const revealedWord = this.currentWord;

    if (this.io) {
      this.io.to(this.code).emit(EVENTS.ROUND_END, {
        word: revealedWord,
        reason,
        scores: this.getScoreboard()
      });

      if (revealedWord) {
        this.broadcastSystemMessage(`The word was: "${revealedWord.toUpperCase()}"`);
      }
    }

    this.broadcastRoomUpdate();

    // Intermission before next turn
    this.timer = setTimeout(() => {
      this.startTurn();
    }, ROUND_INTERMISSION_TIME * 1000);
  }

  endGame() {
    this.clearTimer();
    this.gameState = GAME_STATES.GAME_END;

    const finalScores = this.getScoreboard();

    if (this.io) {
      this.io.to(this.code).emit(EVENTS.GAME_END, {
        finalScores
      });
    }

    this.broadcastRoomUpdate();
  }

  resetToLobby() {
    this.clearTimer();
    this.gameState = GAME_STATES.LOBBY;
    this.currentRound = 0;
    this.currentTurnIndex = -1;
    this.drawerId = null;
    this.currentWord = null;
    this.canvasHistory = [];

    this.players.forEach(p => {
      p.score = 0;
      p.resetRoundState();
    });

    this.broadcastRoomUpdate();
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  broadcastTimer() {
    if (this.io) {
      this.io.to(this.code).emit(EVENTS.TIMER_UPDATE, {
        timeLeft: this.timeLeft,
        totalTime: this.gameState === GAME_STATES.WORD_SELECTION ? WORD_SELECTION_TIME : this.roundTime
      });
    }
  }

  broadcastRoomUpdate() {
    if (this.io) {
      this.io.to(this.code).emit(EVENTS.ROOM_UPDATE, this.getPublicState());
    }
  }

  broadcastSystemMessage(message) {
    if (this.io) {
      this.io.to(this.code).emit(EVENTS.CHAT_MESSAGE, {
        id: 'sys_' + Date.now(),
        sender: 'System',
        message,
        isSystem: true,
        type: 'system'
      });
    }
  }

  getScoreboard() {
    return Array.from(this.players.values())
      .map(p => p.toJSON())
      .sort((a, b) => b.score - a.score);
  }

  getPublicState() {
    const playersList = Array.from(this.players.values()).map(p => p.toJSON());
    return {
      code: this.code,
      hostId: this.hostId,
      players: playersList,
      maxPlayers: this.maxPlayers,
      roundTime: this.roundTime,
      totalRounds: this.totalRounds,
      gameState: this.gameState,
      currentRound: this.currentRound,
      drawerId: this.drawerId,
      maskedWord: this.getMaskedWord(),
      timeLeft: this.timeLeft
    };
  }
}

module.exports = Room;

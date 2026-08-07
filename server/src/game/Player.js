class Player {
  constructor(id, name, avatar = null, isHost = false) {
    this.id = id; // socket id
    this.name = name.trim().slice(0, 16) || 'Anonymous';
    this.avatar = avatar || {
      color: '#6366f1',
      eyes: 1,
      mouth: 1
    };
    this.score = 0;
    this.roundScore = 0;
    this.hasGuessed = false;
    this.isHost = isHost;
    this.isDrawer = false;
    this.guessTime = null; // timestamp when player guessed correctly
  }

  resetRoundState() {
    this.hasGuessed = false;
    this.isDrawer = false;
    this.roundScore = 0;
    this.guessTime = null;
  }

  addScore(points) {
    this.roundScore += points;
    this.score += points;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      score: this.score,
      roundScore: this.roundScore,
      hasGuessed: this.hasGuessed,
      isHost: this.isHost,
      isDrawer: this.isDrawer
    };
  }
}

module.exports = Player;

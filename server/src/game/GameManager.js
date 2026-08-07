const Room = require('./Room');
const { generateRoomCode } = require('../utils/roomCode');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> Room
    this.playerRoomMap = new Map(); // socketId -> roomCode
  }

  createRoom(hostPlayer, options = {}) {
    let code = generateRoomCode();
    // Ensure uniqueness
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    const room = new Room(code, hostPlayer, options);
    this.rooms.set(code, room);
    this.playerRoomMap.set(hostPlayer.id, code);

    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase()) || null;
  }

  getRoomByPlayerId(socketId) {
    const code = this.playerRoomMap.get(socketId);
    return code ? this.getRoom(code) : null;
  }

  joinRoom(code, player) {
    const room = this.getRoom(code);
    if (!room) {
      throw new Error('Room not found');
    }
    room.addPlayer(player);
    this.playerRoomMap.set(player.id, room.code);
    return room;
  }

  leaveRoom(socketId) {
    const code = this.playerRoomMap.get(socketId);
    if (!code) return null;

    const room = this.rooms.get(code);
    if (room) {
      room.removePlayer(socketId);
      if (room.players.size === 0) {
        room.clearTimer();
        this.rooms.delete(code);
      }
    }

    this.playerRoomMap.delete(socketId);
    return room;
  }
}

module.exports = new GameManager();

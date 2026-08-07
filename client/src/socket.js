import { io } from 'socket.io-client';

// Use same host or fallback to port 3001 in dev
const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3001' 
  : window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

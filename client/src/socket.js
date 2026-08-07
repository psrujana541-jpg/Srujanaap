import { io } from 'socket.io-client';

// Use same host or fallback to port 3001 in dev
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'; 

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

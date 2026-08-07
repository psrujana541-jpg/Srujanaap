import { useEffect } from 'react';
import { socket } from '../socket';

export function useSocket(eventName, callback) {
  useEffect(() => {
    if (!eventName || typeof callback !== 'function') return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
}

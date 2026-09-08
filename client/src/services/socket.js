import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Get or initialize single Socket.IO connection instance
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      // console.log(`⚡ [Socket Connected]: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      // console.log(`🔌 [Socket Disconnected]: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ [Socket Connection Error]:', error.message);
    });
  }

  if (socket && !socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Request server to join room for specific event
 */
export function joinEventRoom(eventId) {
  if (!eventId) return;
  const s = getSocket();
  s.emit('join-event', eventId);
}

/**
 * Request server to leave room for specific event
 */
export function leaveEventRoom(eventId) {
  if (!eventId) return;
  const s = getSocket();
  s.emit('leave-event', eventId);
}

/**
 * Subscribe to participant-count-updated events
 */
export function onParticipantCountUpdated(callback) {
  const s = getSocket();
  s.on('participant-count-updated', callback);
}

export function offParticipantCountUpdated(callback) {
  if (socket) {
    socket.off('participant-count-updated', callback);
  }
}

/**
 * Subscribe to event-updated events
 */
export function onEventUpdated(callback) {
  const s = getSocket();
  s.on('event-updated', callback);
}

export function offEventUpdated(callback) {
  if (socket) {
    socket.off('event-updated', callback);
  }
}

/**
 * Subscribe to event-cancelled events
 */
export function onEventCancelled(callback) {
  const s = getSocket();
  s.on('event-cancelled', callback);
}

export function offEventCancelled(callback) {
  if (socket) {
    socket.off('event-cancelled', callback);
  }
}

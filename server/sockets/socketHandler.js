import { Server } from 'socket.io';

let ioInstance = null;

/**
 * Initialize Socket.IO server attached to Node HTTP server
 */
export const initSocketServer = (httpServer, allowedOrigin) => {
  const origin = allowedOrigin || 'http://localhost:5173';

  ioInstance = new Server(httpServer, {
    cors: {
      origin: origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    // console.log(`⚡ [Socket Connected]: ${socket.id}`);

    // Client requests to join an event-specific room
    socket.on('join-event', (eventId) => {
      if (!eventId || typeof eventId !== 'string') return;
      const roomName = `event:${eventId}`;
      socket.join(roomName);
      // console.log(`📌 [Socket ${socket.id}] joined room: ${roomName}`);
    });

    // Client requests to leave an event-specific room
    socket.on('leave-event', (eventId) => {
      if (!eventId || typeof eventId !== 'string') return;
      const roomName = `event:${eventId}`;
      socket.leave(roomName);
      // console.log(`🚪 [Socket ${socket.id}] left room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      // console.log(`🔌 [Socket Disconnected]: ${socket.id}`);
    });
  });

  console.log(`⚡ [Socket.IO initialized]: CORS origin -> ${origin}`);
  return ioInstance;
};

/**
 * Helper function to emit real-time events to a specific event room
 * Used by REST controllers after successful database mutations
 */
export const emitToEventRoom = (eventId, eventName, payload) => {
  if (!ioInstance) {
    console.warn('⚠️ [Socket.IO Warning]: Socket instance not initialized yet.');
    return;
  }

  if (!eventId) return;

  const roomName = `event:${eventId}`;
  ioInstance.to(roomName).emit(eventName, payload);
  // console.log(`📡 [Socket Broadcast] Room: ${roomName} | Event: ${eventName}`);
};

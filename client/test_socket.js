import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
const eventId = '6a9ece74f6215cf8944f592f';

socket.on('connect', () => {
  console.log('✅ Client 1 connected to Socket.IO server:', socket.id);
  socket.emit('join-event', eventId);
  console.log('📌 Client 1 emitted join-event for:', eventId);
});

socket.on('participant-count-updated', (data) => {
  console.log('🎉 [Client 1 Real-Time Broadcast Received]:', JSON.stringify(data));
  socket.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.log('⏳ Timeout waiting for socket event');
  process.exit(1);
}, 10000);

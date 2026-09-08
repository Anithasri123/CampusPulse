import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
const eventId = '6a9ece74f6215cf8944f592f';
const userId = '6a9ece74f6215cf8944f592a';

socket.on('connect', async () => {
  console.log('✅ Socket connected:', socket.id);
  socket.emit('join-event', eventId);
  console.log('📌 Joined room:', `event:${eventId}`);

  // Trigger REST API call 500ms after joining room
  setTimeout(async () => {
    console.log('🚀 Triggering REST POST /api/events/:id/register...');
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      console.log('📥 REST Response:', json.message);
    } catch (err) {
      console.error('REST Error:', err);
    }
  }, 500);
});

socket.on('participant-count-updated', (data) => {
  console.log('🎉 [REAL-TIME SOCKET EVENT RECEIVED!]:', JSON.stringify(data));
  console.log('✨ Success! Socket.IO room broadcast verified.');
  socket.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Timeout waiting for socket event');
  process.exit(1);
}, 6000);

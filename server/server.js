import dotenv from 'dotenv';
import { createServer } from 'http';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocketServer } from './sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;

// Validate essential environment variables on startup
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ [Configuration Error]: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('🚫 Server startup aborted. Please define missing variables in your .env configuration file.');
  process.exit(1);
}

// Create HTTP server wrapping Express app for Socket.IO attachment
const httpServer = createServer(app);

// Attach Socket.IO real-time server
initSocketServer(httpServer, process.env.CLIENT_URL);

// Initialize Database connection then start HTTP server
const startServer = async () => {

  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 [CampusPulse Server]: Running on http://localhost:${PORT}`);
    console.log(`🏥 [Health Check]: http://localhost:${PORT}/api/health`);
    console.log(`⚡ [Real-Time Socket.IO]: Active on port ${PORT}`);
  });
};

startServer();

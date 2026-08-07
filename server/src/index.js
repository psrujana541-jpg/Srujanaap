const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const initializeSocket = require('./socket/socketHandler');

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Drawlulu Server running on port ${PORT}`);
  console.log(`=================================`);
});

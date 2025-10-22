const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const port = parseInt(process.env.PORT ?? '4000', 10);
const eventName = process.env.SOCKET_EVENT_NAME || process.env.NEXT_PUBLIC_VIDEO_EVENT || 'video-event';

const app = express();
const server = http.createServer(app);

const corsOrigins = process.env.SOCKET_CORS_ORIGIN
  ? process.env.SOCKET_CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : ['http://localhost:3000'];

const io = new Server(server, {
  cors: corsOrigins
    ? {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      }
    : undefined,
});

io.on('connection', socket => {
  const { roomId, userId } = socket.handshake.query;
  console.log(`Socket connected: ${socket.id} room:${roomId ?? '-'} user:${userId ?? '-'}`);

  if (roomId) {
    socket.join(roomId);
  }

  socket.on('room:notify', payload => {
    const targetRoom = payload?.roomId || roomId;
    if (targetRoom) {
      io.to(targetRoom).emit(eventName, payload);
    } else {
      io.emit(eventName, payload);
    }
  });

  socket.on('disconnect', reason => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

server.listen(port, err => {
  if (err) {
    console.error('Failed to start socket server', err);
    process.exit(1);
  }
  console.log(`Socket server ready on http://localhost:${port}`);
});

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT) || 8082;
const ROOT = __dirname;
const rooms = new Map();
const TOPICS = new Set(['marvel-films', 'animals', 'food', 'countries', 'marvel-characters', 'disney-pixar', 'harry-potter', 'mythical-creatures', 'tv-series']);
const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/game.js': ['game.js', 'text/javascript; charset=utf-8'],
};

function send(socket, message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function roomState(room) {
  return {
    code: room.code,
    topic: room.topic,
    players: room.players.length,
    phase: room.phase,
    selections: room.selections.map(Boolean),
    rematchReady: [...room.rematchReady],
    rematchStarter: room.rematchStarter,
  };
}

function broadcast(room) {
  room.players.forEach((player) => send(player, { type: 'room_state', ...roomState(room) }));
}

function newCode() {
  let code;
  do code = String(Math.floor(1000 + Math.random() * 9000)); while (rooms.has(code));
  return code;
}

function leave(socket) {
  const room = rooms.get(socket.roomCode);
  socket.roomCode = null;
  socket.playerIndex = null;
  if (!room) return;
  room.players = room.players.filter((player) => player !== socket);
  if (!room.players.length) rooms.delete(room.code);
  else {
    room.phase = 'lobby';
    room.selections = [null, null];
    room.rematchReady.clear();
    room.rematchStarter = null;
    broadcast(room);
  }
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const file = files[requestUrl.pathname];
  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  fs.readFile(path.join(ROOT, file[0]), (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end('Server error');
      return;
    }
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    response.end(content);
  });
});

const webSocketServer = new WebSocketServer({ server });
webSocketServer.on('connection', (socket) => {
  socket.roomCode = null;
  socket.playerIndex = null;

  socket.on('message', (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return send(socket, { type: 'error', message: 'Некорректная команда.' }); }

    if (message.type === 'create_room') {
      leave(socket);
      const topic = TOPICS.has(message.topic) ? message.topic : 'marvel-films';
      const room = { code: newCode(), topic, players: [socket], phase: 'lobby', selections: [null, null], rematchReady: new Set(), rematchStarter: null };
      rooms.set(room.code, room);
      socket.roomCode = room.code;
      socket.playerIndex = 0;
      send(socket, { type: 'room_joined', playerIndex: 0, ...roomState(room) });
      return;
    }

    if (message.type === 'join_room') {
      const room = rooms.get(String(message.code ?? '').trim());
      if (!room || room.players.length >= 2 || room.phase !== 'lobby') return send(socket, { type: 'error', message: 'Комната недоступна.' });
      leave(socket);
      room.players.push(socket);
      socket.roomCode = room.code;
      socket.playerIndex = 1;
      send(socket, { type: 'room_joined', playerIndex: 1, ...roomState(room) });
      broadcast(room);
      return;
    }

    const room = rooms.get(socket.roomCode);
    if (!room) return;
    if (message.type === 'start_game') {
      if (socket.playerIndex !== 0 || room.players.length !== 2) return;
      room.phase = 'selection';
      room.selections = [null, null];
      room.rematchReady.clear();
      room.rematchStarter = null;
      broadcast(room);
      return;
    }
    if (message.type === 'select_card') {
      const cardId = String(message.cardId ?? '');
      if (room.phase !== 'selection' || !cardId) return;
      room.selections[socket.playerIndex] = cardId;
      if (room.selections.every(Boolean)) room.phase = 'playing';
      broadcast(room);
      return;
    }
    if (message.type === 'request_rematch') {
      if (room.phase !== 'playing') return;
      if (room.rematchStarter === null) room.rematchStarter = socket.playerIndex;
      room.rematchReady.add(socket.playerIndex);
      if (room.rematchReady.size === 2) {
        room.phase = 'rematch_setup';
      }
      broadcast(room);
      return;
    }
    if (message.type === 'set_rematch_topic') {
      if (room.phase !== 'rematch_setup' || socket.playerIndex !== room.rematchStarter || !TOPICS.has(message.topic)) return;
      room.topic = message.topic;
      room.phase = 'selection';
      room.selections = [null, null];
      room.rematchReady.clear();
      room.rematchStarter = null;
      broadcast(room);
      return;
    }
    if (message.type === 'leave_room') {
      leave(socket);
      send(socket, { type: 'left_room' });
    }
  });

  socket.on('close', () => leave(socket));
});

server.listen(PORT, '0.0.0.0', () => console.log(`Card Guessing: http://localhost:${PORT}`));

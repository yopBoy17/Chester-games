const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer, WebSocket } = require("ws");
const { MultiplayerGameEngine } = require("./shared-game-engine");

const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";
const PUBLIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/game.js", ["game.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/manifest.webmanifest", ["manifest.webmanifest", "application/manifest+json; charset=utf-8"]],
  ["/sw.js", ["sw.js", "text/javascript; charset=utf-8"]],
  ["/icon.svg", ["icon.svg", "image/svg+xml"]],
]);
const rooms = new Map();

function send(socket, message) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(message));
}

function createRoomCode() {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

function broadcastRoom(room) {
  for (const player of room.players) {
    send(player, {
      type: "room_state",
      roomCode: room.code,
      players: room.players.length,
      score: room.score,
      round: room.round,
      rematchReady: [...room.rematchReady],
    });
  }
}

function startRoomGame(room, settings) {
  room.settings = settings ? { ...settings } : room.settings;
  room.round += 1;
  room.rematchReady.clear();
  room.game = new MultiplayerGameEngine({
    ...room.settings,
    enemyColor: room.settings.enemyColor,
    swapSpawns: room.round % 2 === 0,
  });
  room.settings.enemyColor = room.game.enemyColorName;
  room.resultRecorded = false;
  room.gameStartsAt = Date.now() + 3000;
  room.lastTickAt = room.gameStartsAt;
  room.lastBroadcastAt = 0;
  const snapshot = room.game.createSnapshot();
  for (const player of room.players) {
    send(player, {
      type: "game_started",
      snapshot,
      startsAt: room.gameStartsAt,
      score: room.score,
      round: room.round,
    });
  }
}

function leaveRoom(socket) {
  if (!socket.roomCode) return;
  const room = rooms.get(socket.roomCode);
  socket.roomCode = null;
  socket.playerIndex = null;
  if (!room) return;

  if (room.players[0] === socket) {
    for (const player of room.players.slice(1)) {
      player.roomCode = null;
      player.playerIndex = null;
      send(player, {
        type: "error",
        message: "Создатель комнаты отключился.",
      });
    }
    rooms.delete(room.code);
    return;
  }

  room.players = room.players.filter((player) => player !== socket);
  room.game = null;
  room.rematchReady.clear();
  broadcastRoom(room);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const publicFile = PUBLIC_FILES.get(requestUrl.pathname);

  if (!publicFile) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const [fileName, contentType] = publicFile;
  fs.readFile(path.join(__dirname, fileName), (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Server error");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    response.end(content);
  });
});

const webSocketServer = new WebSocketServer({ server });

setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (!room.game || room.players.length !== 2) continue;
    if (now < room.gameStartsAt) continue;

    let elapsed = Math.min((now - room.lastTickAt) / 1000, 0.25);
    room.lastTickAt = now;
    while (elapsed > 0) {
      const step = Math.min(elapsed, 0.05);
      room.game.update(step);
      elapsed -= step;
    }

    if (room.game.result && !room.resultRecorded) {
      room.resultRecorded = true;
      const winnerIndex = room.game.result === "Победа!" ? 0 : 1;
      room.score[winnerIndex] += 1;
      for (const player of room.players) {
        send(player, {
          type: "match_finished",
          winnerIndex,
          score: room.score,
          round: room.round,
        });
      }
    }

    if (now - room.lastBroadcastAt < 100) continue;
    room.lastBroadcastAt = now;
    const state = room.game.createState();
    for (const player of room.players) {
      send(player, { type: "game_state", state });
    }
  }
}, 50);

webSocketServer.on("connection", (socket) => {
  socket.roomCode = null;
  socket.playerIndex = null;

  socket.on("message", (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
    } catch {
      send(socket, { type: "error", message: "Некорректное сообщение." });
      return;
    }

    if (message.type === "create_room") {
      leaveRoom(socket);
      const roomCode = createRoomCode();
      const room = {
        code: roomCode,
        players: [socket],
        game: null,
        settings: null,
        score: [0, 0],
        round: 0,
        rematchReady: new Set(),
        resultRecorded: false,
        gameStartsAt: 0,
        lastTickAt: Date.now(),
        lastBroadcastAt: 0,
      };
      rooms.set(roomCode, room);
      socket.roomCode = roomCode;
      socket.playerIndex = 0;
      send(socket, {
        type: "room_joined",
        roomCode,
        playerIndex: 0,
        players: 1,
        score: room.score,
        round: room.round,
      });
      return;
    }

    if (message.type === "join_room") {
      const roomCode = String(message.roomCode ?? "").trim();
      const room = rooms.get(roomCode);
      if (!room) {
        send(socket, { type: "error", message: "Комната не найдена." });
        return;
      }
      if (room.players.length >= 2) {
        send(socket, { type: "error", message: "Комната уже заполнена." });
        return;
      }

      leaveRoom(socket);
      room.players.push(socket);
      socket.roomCode = roomCode;
      socket.playerIndex = 1;
      send(socket, {
        type: "room_joined",
        roomCode,
        playerIndex: 1,
        players: 2,
        score: room.score,
        round: room.round,
      });
      broadcastRoom(room);
      return;
    }

    const room = rooms.get(socket.roomCode);
    if (!room) {
      send(socket, { type: "error", message: "Сначала войди в комнату." });
      return;
    }

    if (message.type === "start_game") {
      if (socket.playerIndex !== 0) {
        send(socket, { type: "error", message: "Игру запускает создатель комнаты." });
        return;
      }
      if (room.players.length !== 2) {
        send(socket, { type: "error", message: "Нужен второй игрок." });
        return;
      }
      startRoomGame(room, message.settings);
      return;
    }

    if (message.type === "command" && room.game) {
      room.game.applyCommand(socket.playerIndex, message.command);
      return;
    }

    if (message.type === "rematch_ready" && room.game?.result) {
      room.rematchReady.add(socket.playerIndex);
      for (const player of room.players) {
        send(player, {
          type: "rematch_state",
          ready: [...room.rematchReady],
          score: room.score,
          round: room.round,
        });
      }
      if (room.rematchReady.size === 2) startRoomGame(room);
      return;
    }

    send(socket, { type: "error", message: "Неизвестная команда." });
  });

  socket.on("close", () => leaveRoom(socket));
});

server.listen(PORT, HOST, () => {
  console.log(`Planet Flow multiplayer: http://localhost:${PORT}`);
});

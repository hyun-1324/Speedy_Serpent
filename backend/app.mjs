import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import GameState from './models/gameState.js';
import { players } from './models/players.js';
import { gameLoop } from './models/gameLoop.js';
import {
  checkPlayerNumber,
  registerPlayer,
  removePlayer,
  getHost,
  isPlayerRegistered,
  getPlayersInfo,
  isHost,
} from './utils/playerUtils.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: '*', // Allow requests from the Vite dev server
    methods: ['GET', 'POST'],
  },
});

const gameState = new GameState();

// dev mode
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Serve static files with cache control
// Serve built files
// app.use(
//   express.static(path.join(__dirname, '../frontend/dist'), {
//     maxAge: 86400000,
//     setHeaders: (res, path) => {
//       res.setHeader('Cache-Control', 'public, max-age=86400');
//     },
//   })
// // );

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });

io.on('connection', socket => {
  if (!checkPlayerNumber(socket)) {
    socket.emit('error', { message: 'The room is full.' });
    socket.disconnect();
    return;
  } else if (gameState.isStarted) {
    socket.emit('error', { message: 'The game has already started.' });
    socket.disconnect();
    return;
  }

  socket.on('registerPlayer', name => {
    if (!checkPlayerNumber(socket)) {
      socket.emit('error', { message: 'The room is full.' });
      socket.disconnect();
      return;
    } else if (gameState.isStarted) {
      socket.emit('error', { message: 'The game has already started.' });
      socket.disconnect();
      return;
    }

    registerPlayer(socket, name, result => {
      socket.emit('registrationResult', result);
      socket.emit('gameDuration', gameLoop.getGameDuration());

      if (result.success) {
        io.emit('userStateUpdate', {
          host: getHost(),
          players: Object.values(getPlayersInfo()),
        });
      }
    });
  });

  socket.on('startGame', async () => {
    if (!isHost(socket.id)) {
      socket.emit('error', { message: 'You are not the host!' });
      return;
    }
    // Send the game has already started message to connected clients that have not registered
    const clients = Array.from(io.sockets.sockets.keys());

    for (const id of clients) {
      if (!isPlayerRegistered(id)) {
        io.to(id).emit('error', { message: 'The game has already started.' });
        io.sockets.sockets.get(id).disconnect();
      }
    }

    gameState.startGame();
    io.emit('startGame', gameState.getGameState());

    await gameState.countDown(io);

    gameLoop.initializeIntervals(io);
  });

  socket.on('togglePause', () => {
    if (!isPlayerRegistered(socket.id)) {
      socket.emit('error', { message: 'You are not registered!' });
      return;
    }

    const isPaused = gameState.togglePause();
    io.emit('gamePauseStateChanged', {
      isPaused,
      pausedBy: getPlayersInfo()[socket.id].name,
    });
  });

  socket.on('backTolobby', () => {
    if (!isHost(socket.id)) {
      socket.emit('error', { message: 'You are not the host!' });
      return;
    }

    gameState.backToLobby();
    io.emit('backTolobby', gameState.getGameState());
  });

  socket.on('move', direction => {
    if (!isPlayerRegistered(socket.id)) {
      socket.emit('error', { message: 'You are not registered!' });
      return;
    }

    const playerName = getPlayersInfo()[socket.id].name;
    players.updatePlayerDirection(playerName, direction);
  });

  socket.on('gameDuration', newDuration => {
    if (!isHost(socket.id)) {
      socket.emit('error', { message: 'You are not the host!' });
      return;
    }

    const gameDurationUpdateResult = gameLoop.updateGameDuration(newDuration);

    if (gameDurationUpdateResult) {
      io.emit('gameDuration', newDuration);
    }
  });

  socket.on('disconnect', () => {
    if (!isPlayerRegistered(socket.id)) return;

    const playerName = getPlayersInfo()[socket.id].name;

    removePlayer(socket);

    if (gameState.isStarted) {
      // If the game has started and the player disconnects/quits, send only a playerQuit event
      players.removePlayer(playerName);

      io.emit('playerQuit', {
        playerName,
        host: getHost(),
      });

      if (players.players.length === 1 || players.players.length === 0) {
        gameState.backToLobby();
        io.emit('backTolobby', gameState.getGameState());
      }
    } else {
      // Use userStateUpdate event to update the user list if the game has not started
      io.emit('userStateUpdate', {
        host: getHost(),
        players: Object.values(getPlayersInfo()),
      });
    }
  });
});

export { gameState };

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

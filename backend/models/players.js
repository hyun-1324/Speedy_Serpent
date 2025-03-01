import { SEGMENT_SIZE, BOARD_HEIGHT, BOARD_WIDTH } from '../../constants.js';

import { handleCollisions } from '../utils/collisionUtils.js';

import { playersInfo } from '../utils/playerUtils.js';

import { gameState } from '../app.mjs';

class PlayerState {
  constructor() {
    this.players = [];
    this.startingPositions = [
      { x: SEGMENT_SIZE * 3, y: SEGMENT_SIZE * 5, direction: 'up' },
      {
        x: BOARD_WIDTH - SEGMENT_SIZE * 3,
        y: BOARD_HEIGHT - SEGMENT_SIZE * 5,
        direction: 'down',
      },
      {
        x: BOARD_WIDTH - SEGMENT_SIZE * 5,
        y: SEGMENT_SIZE * 3,
        direction: 'left',
      },
      {
        x: SEGMENT_SIZE * 5,
        y: BOARD_HEIGHT - SEGMENT_SIZE * 3,
        direction: 'right',
      },
    ];
  }

  getPlayers() {
    return this.players;
  }

  getPlayerNamesAndSnakes() {
    return this.players.map(player => ({
      name: player.name,
      snake: player.snake,
    }));
  }

  getPlayersForGameState() {
    return this.players.map(player => ({
      name: player.name,
      score: player.score,
      speedMultiplier: player.speedMultiplier,
      position: player.position,
      isAlive: player.isAlive,
      snake: {
        direction: player.snake.direction,
        predictedPosition: player.snake.predictedPosition,
        lastConfirmedPosition: player.snake.lastConfirmedPosition,
      },
    }));
  }

  initializePlayer(name) {
    if (this.players.length >= this.startingPositions.length) {
      return;
    }

    const playerIndex = this.players.findIndex(p => p.name === name);

    const startPosition = this.startingPositions[this.players.length];
    const snakeDirection = startPosition.direction;

    const botLevel = getBotLevel(playersInfo, name);
    const botBehavior = getBotBehavior(playersInfo, name);

    const playerConfig = {
      name,
      score: 0,
      position: { ...startPosition },
      isAlive: true,
      speedMultiplier: 1,
      buffEnding: false,
      moveCounter: 0,
      plainCounter: 0,
      botLevel: botLevel,
      botBehavior: botBehavior,
      speedEffectTimer: null,
      remainingBuffDuration: 0,
      snake: {
        direction: snakeDirection,
        nextDirection: snakeDirection,
        predictedPosition: {
          head: { ...startPosition },
          body: [
            {
              x:
                startPosition.x +
                (snakeDirection === 'left'
                  ? SEGMENT_SIZE
                  : snakeDirection === 'right'
                  ? -SEGMENT_SIZE
                  : 0),
              y:
                startPosition.y +
                (snakeDirection === 'up'
                  ? -SEGMENT_SIZE
                  : snakeDirection === 'down'
                  ? SEGMENT_SIZE
                  : 0),
            },
            {
              x:
                startPosition.x +
                (snakeDirection === 'left'
                  ? 2 * SEGMENT_SIZE
                  : snakeDirection === 'right'
                  ? -2 * SEGMENT_SIZE
                  : 0),
              y:
                startPosition.y +
                (snakeDirection === 'up'
                  ? -2 * SEGMENT_SIZE
                  : snakeDirection === 'down'
                  ? 2 * SEGMENT_SIZE
                  : 0),
            },
          ],
        },
        lastConfirmedPosition: {
          head: { ...startPosition },
          body: [
            {
              x:
                startPosition.x +
                (snakeDirection === 'left'
                  ? SEGMENT_SIZE
                  : snakeDirection === 'right'
                  ? -SEGMENT_SIZE
                  : 0),
              y:
                startPosition.y +
                (snakeDirection === 'up'
                  ? -SEGMENT_SIZE
                  : snakeDirection === 'down'
                  ? SEGMENT_SIZE
                  : 0),
            },
            {
              x:
                startPosition.x +
                (snakeDirection === 'left'
                  ? 2 * SEGMENT_SIZE
                  : snakeDirection === 'right'
                  ? -2 * SEGMENT_SIZE
                  : 0),
              y:
                startPosition.y +
                (snakeDirection === 'up'
                  ? -2 * SEGMENT_SIZE
                  : snakeDirection === 'down'
                  ? 2 * SEGMENT_SIZE
                  : 0),
            },
          ],
        },
      },
    };

    if (playerIndex !== -1) {
      this.players[playerIndex] = playerConfig;
    } else {
      this.players.push(playerConfig);
    }

    return playerConfig;
  }

  movePlayer(playerName, collisionEvents) {
    const player = this.players.find(p => p.name === playerName);
    if (!player || !player.isAlive) return false;

    player.moveCounter++;
    if (player.speedMultiplier < 1) {
      if (player.moveCounter < 1 / player.speedMultiplier) {
        return false;
      } else if (player.buffEnding) {
        player.speedMultiplier = 1;
        player.buffEnding = false;
      }
    }

    player.moveCounter = 0;

    player.snake.direction = player.snake.nextDirection;

    player.snake.lastConfirmedPosition = {
      head: { ...player.snake.predictedPosition.head },
      body: [...player.snake.predictedPosition.body],
    };

    const newHead = this.calculateNewPosition(
      player.snake.predictedPosition.head,
      player.snake.direction
    );

    const newBody = [
      { ...player.snake.predictedPosition.head },
      ...player.snake.predictedPosition.body.slice(0, -1),
    ];

    player.snake.predictedPosition = {
      head: newHead,
      body: newBody,
    };

    const collisionResult = handleCollisions(player, collisionEvents);

    return collisionResult;
  }

  calculateNewPosition = (currentPosition, direction) => {
    const newPosition = { ...currentPosition };

    switch (direction) {
      case 'up':
        newPosition.y += SEGMENT_SIZE;
        break;
      case 'down':
        newPosition.y -= SEGMENT_SIZE;
        break;
      case 'left':
        newPosition.x -= SEGMENT_SIZE;
        break;
      case 'right':
        newPosition.x += SEGMENT_SIZE;
        break;
    }

    return newPosition;
  };

  updatePlayerDirection(playerName, newDirection) {
    const player = this.players.find(p => p.name === playerName);
    if (!(player && !gameState.getPaused())) return;

    const currentDirection = player.snake.direction;
    if (
      (currentDirection === 'up' && newDirection === 'down') ||
      (currentDirection === 'down' && newDirection === 'up') ||
      (currentDirection === 'left' && newDirection === 'right') ||
      (currentDirection === 'right' && newDirection === 'left')
    ) {
      return;
    }

    player.snake.nextDirection = newDirection;
  }

  emptyPlayers() {
    this.players = [];
  }

  clearSpeedEffectTimer() {
    this.players.forEach(player => {
      if (player.speedEffectTimer) {
        clearInterval(player.speedEffectTimer);
      }
    });
  }

  removePlayer(playerName) {
    const playerIndex = this.players.findIndex(p => p.name === playerName);
    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);
    }
  }
}

function getBotLevel(playersInfo, targetName) {
  for (const key in playersInfo) {
    if (playersInfo[key].name === targetName) {
      return playersInfo[key].botLevel ?? false;
    }
  }
  return false;
}

function getBotBehavior(playersInfo, targetName) {
  for (const key in playersInfo) {
    if (playersInfo[key].name === targetName) {
      return playersInfo[key].botBehavior ?? false;
    }
  }
  return false;
}

export const players = new PlayerState();

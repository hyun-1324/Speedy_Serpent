import { gameState } from '../app.mjs';
import { players } from './players.js';
import { resources } from './resources.js';
import {
  MOVE_INTERVAL,
  DEFAULT_GAME_DURATION,
  SEGMENT_SIZE,
} from '../../constants.js';
import { isMultyPlay } from '../utils/playModeUtils.js';
import { processAIBot } from '../ai/AIbot.js';

class GameLoop {
  constructor() {
    this.timer = null;
    this.gameDuration = DEFAULT_GAME_DURATION;
    this.moveInterval = null;
    this.timerInterval = null;
    this.gameLoopTimeout = null;
    this.pauseDuration = 0;
    this.iterationCounter = 0;
  }

  getTimer() {
    return this.timer;
  }

  getMoveInterval() {
    return this.moveInterval;
  }

  getGameDuration() {
    return this.gameDuration;
  }

  initializeIntervals(io) {
    let lastUpdateTime = Date.now();

    const gameLoop = () => {
      const now = Date.now();

      if (this.pauseDuration > 0) {
        lastUpdateTime += this.pauseDuration;
        this.pauseDuration = 0;
      }

      const elapsedTime = now - lastUpdateTime;

      if (
        !gameState.getPaused() &&
        gameState.getStarted() &&
        !gameState.getEnded()
      ) {
        if (elapsedTime >= this.moveInterval / 2) {
          const isSpeedupTurn = this.iterationCounter % 2 === 1;
          this.processMovement(io, isSpeedupTurn);

          lastUpdateTime = now;

          this.iterationCounter++;
        }
      } else if (gameState.getPaused()) {
        this.pauseDuration += elapsedTime;
      }

      this.gameLoopTimeout = setTimeout(gameLoop, 10);
    };

    gameLoop();

    this.timerInterval = setInterval(() => {
      if (!gameState.getPaused() && gameState.getStarted()) {
        this.timer--;

        if (this.timer % (this.gameDuration / 4) === 0) {
          this.moveInterval = Math.round(this.moveInterval / 1.2);
        }

        if (resources.getResourceBatchTimer() <= 0) {
          const alivePlayers = players
            .getPlayers()
            .filter(p => p.isAlive).length;
          const resourceAmount = 30 + alivePlayers * 20;
          resources.addResourceBatch(resourceAmount);
          resources.updateResourceBatchTimer(30, true);
          io.emit('resourceBatchAdded', {
            newTotal: resources.getResources().length,
            nextBatchIn: resources.getResourceBatchTimer(),
          });
        }
        resources.updateResourceBatchTimer(-1, false);

        if (this.timer > 0) {
          io.emit('timerUpdate', this.timer);
        } else {
          const finalScores = gameState.endGame();
          io.emit('gameOver', {
            scores: finalScores,
            winner: finalScores[0],
          });
        }
      }
    }, 1000);
  }

  processMovement(io, isSpeedupTurn = false) {
    let collisionEvents = [];

    players.getPlayers().forEach(player => {
      if (player.isAlive && (!isSpeedupTurn || player.speedMultiplier > 1)) {
        if (player.botLevel) {
          try {
            const direction = processAIBot(player.name, player.botLevel);
            if (direction) {
              players.updatePlayerDirection(player.name, direction);
            }
          } catch (error) {
            console.error(`Error processing AI bot ${player.name}:`, error);
          }
        }
        const collisionType = players.movePlayer(player.name, collisionEvents);
        if (collisionType) {
          collisionEvents.push({
            playerName: player.name,
            type: collisionType,
          });
        }
      }
    });

    io.emit('gameStateUpdate', gameState.getGameState());

    if (collisionEvents.length > 0) {
      io.emit('collisions', collisionEvents);
    }

    const alivePlayers = players.getPlayers().filter(p => p.isAlive);
    if (alivePlayers.length === 0) {
      const finalScores = gameState.endGame();
      io.emit('gameOver', {
        scores: finalScores,
        winner: finalScores[0],
      });
    }
  }

  clearIntervals() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.gameLoopTimeout) {
      clearTimeout(this.gameLoopTimeout);
      this.gameLoopTimeout = null;
    }
    this.iterationCounter = 0;
    this.pauseDuration = 0;
    this.moveInterval = MOVE_INTERVAL;
    this.timer = this.gameDuration;
  }

  updateGameDuration(newGameDuration) {
    if (![60, 120, 180].includes(newGameDuration)) {
      return false;
    }
    if (!gameState.getStarted() && this.gameDuration !== newGameDuration) {
      this.gameDuration = newGameDuration;
      return true;
    }
    return false;
  }
}

export const gameLoop = new GameLoop();

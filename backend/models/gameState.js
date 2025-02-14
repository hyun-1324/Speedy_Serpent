import { getPlayersInfo } from '../utils/playerUtils.js';
import { players } from './players.js';
import { resources } from './resources.js';
import { gameLoop } from './gameLoop.js';

export default class GameState {
  constructor() {
    this.isPaused = false;
    this.isStarted = false;
    this.hasEnded = false;
    this.isCountingDown = false;
  }

  getGameState() {
    return {
      isPaused: this.isPaused,
      isStarted: this.isStarted,
      timer: gameLoop.getTimer(),
      resources: resources.getResources(),
      gameSpeed: gameLoop.getMoveInterval(),
      players: players.getPlayersForGameState(),
    };
  }

  getStarted() {
    return this.isStarted;
  }

  getPaused() {
    return this.isPaused;
  }

  getEnded() {
    return this.hasEnded;
  }

  startGame() {
    this.isPaused = false;
    this.isStarted = true;
    this.hasEnded = false;
    gameLoop.clearIntervals();
    players.emptyPlayers();
    resources.resetResources();

    Object.values(getPlayersInfo()).forEach(playerInfo => {
      players.initializePlayer(playerInfo.name);
    });
  }

  async countDown(io) {
    this.isCountingDown = true;
    let count = 3;

    while (count > 0) {
      io.emit('countdown', count);
      await new Promise(resolve => setTimeout(resolve, 1000));
      count--;
    }

    io.emit('countdown', 'start');
    this.isCountingDown = false;
  }

  togglePause() {
    if (this.isCountingDown) {
      return this.isPaused;
    }

    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  endGame() {
    this.isPaused = false;
    this.hasEnded = true;
    players.clearSpeedEffectTimer();

    gameLoop.clearIntervals();

    return players
      .getPlayers()
      .map(player => ({
        name: player.name,
        score: player.score,
      }))
      .sort((a, b) => b.score - a.score);
  }

  backToLobby() {
    players.clearSpeedEffectTimer();
    gameLoop.clearIntervals();
    this.isPaused = false;
    this.isStarted = false;
    this.hasEnded = false;
  }
}

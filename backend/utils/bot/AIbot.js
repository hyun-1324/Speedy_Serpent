import { processNormalBot } from './normalBot.js';
import { processBoldBot } from './boldBot.js';
import { processAggressiveBot } from './aggressiveBot.js';
import {
  skipTurn,
  getNextGrid,
  getDirectionFromGrid,
  getNeighbors,
} from './botUtils.js';

function processAIBots(players, resources) {
  const botPlayers = players.getPlayers().filter(player => player.botLevel);

  const playerPositions = players
    .getPlayers()
    .map(player => [
      player.snake.predictedPosition.head,
      ...player.snake.predictedPosition.body,
    ])
    .flat();

  const playersHeadPositions = players
    .getPlayers()
    .map(player => [player.snake.predictedPosition.head])
    .flat();

  const resourcesList = resources.getResources();

  botPlayers.forEach(bot => {
    if (!bot.isAlive) return true;
    if (skipTurn(bot)) return;

    const botHead = bot.snake.predictedPosition.head;
    const nextGrid = getNextGrid(botHead, bot.snake.direction);

    const gridToMove = calculatePath(
      bot,
      playerPositions,
      resourcesList,
      playersHeadPositions
    );
    const direction = getDirectionFromGrid(botHead, gridToMove);

    if (direction) {
      players.updatePlayerDirection(bot.name, direction);
      playerPositions.push(gridToMove);
    } else {
      const availableDirections = getNeighbors(botHead, playerPositions);
      if (availableDirections.length === 0) return;

      if (
        nextGrid &&
        availableDirections.some(
          coords => coords.x === nextGrid.x && coords.y === nextGrid.y
        )
      ) {
        playerPositions.push(nextGrid);
        return;
      } else {
        const randomGrid =
          availableDirections[
            Math.floor(Math.random() * availableDirections.length)
          ];
        const randomDirection = getDirectionFromGrid(botHead, randomGrid);
        players.updatePlayerDirection(bot.name, randomDirection);
        playerPositions.push(randomGrid);
      }
    }
  });
}

function calculatePath(
  player,
  playerPositions,
  resourcesList,
  playersHeadPositions
) {
  switch (player.botBehavior) {
    case 'aggressive':
      return processAggressiveBot(
        player,
        playerPositions,
        resourcesList,
        playersHeadPositions
      );
    case 'bold':
      return processBoldBot(player, playerPositions, resourcesList);
    case 'normal':
      return processNormalBot(player, playerPositions, resourcesList);
  }
}

export { processAIBots };

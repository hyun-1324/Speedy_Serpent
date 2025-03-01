import { findPathToTarget } from './aStarAlgorithm.js';
import { findNearestResource, difficultyProbabilities } from './botUtils.js';

function processNormalBot(bot, playerPositions, resourcesList) {
  const botHead = bot.snake.predictedPosition.head;

  // Adjust behavior based on difficulty
  const shouldSkip = Math.random() < difficultyProbabilities[bot.botLevel];
  if (shouldSkip) {
    return null;
  }

  const nearestResource = findNearestResource(botHead, resourcesList);
  if (!nearestResource) return null;

  const direction = findPathToTarget(botHead, nearestResource, playerPositions);

  if (direction) {
    return direction[1];
  } else {
    return null;
  }
}

export { processNormalBot };

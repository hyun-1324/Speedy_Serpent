import { findPathToTarget } from './aStarAlgorithm.js';
import {
  difficultyProbabilities,
  findNearestSelectedResource,
  findNearestResource,
} from './botUtils.js';

function processSafeBot(bot, playerPositions, resourcesList) {
  const botHead = bot.snake.predictedPosition.head;

  // Adjust behavior based on difficulty
  const shouldSkip = Math.random() < difficultyProbabilities[bot.botLevel];
  if (shouldSkip) {
    return null;
  }

  let targetResource = findNearestSelectedResource(botHead, resourcesList, [
    'plain',
    'slowdown',
  ]);
  if (!targetResource) {
    targetResource = findNearestSelectedResource(botHead, resourcesList, [
      'speedup',
    ]);
  }
  if (!targetResource) return null;

  const direction = findPathToTarget(
    botHead,
    targetResource,
    playerPositions,
    true
  );

  if (direction) {
    return direction[1];
  } else {
    return null;
  }
}

export { processSafeBot };

import { findPathToTarget } from './aStarAlgorithm.js';
import {
  findNearestResource,
  difficultyProbabilities,
  calculateDistance,
} from './botUtils.js';

function processAggressiveBot(
  bot,
  playerPositions,
  resourcesList,
  playersHeadPositions
) {
  const botHead = bot.snake.predictedPosition.head;

  // Adjust behavior based on difficulty
  const shouldSkip = Math.random() < difficultyProbabilities[bot.botLevel];
  if (shouldSkip) {
    return null;
  }

  // Filter out bot's own head position from players head positions
  const otherPlayersHeads = playersHeadPositions.filter(
    head => head.x !== botHead.x || head.y !== botHead.y
  );

  // Find nearest player head within 5 blocks using Manhattan distance
  const nearestPlayerHead = otherPlayersHeads.reduce((nearest, head) => {
    const distance = calculateDistance(botHead, head);
    return !nearest || distance < calculateDistance(botHead, nearest)
      ? head
      : nearest;
  }, null);

  // If there's a nearby player, chase them instead of going for resources
  if (nearestPlayerHead && calculateDistance(botHead, nearestPlayerHead) < 90) {
    // Remove target head position from playerPositions to allow path to target
    const filteredPlayerPositions = playerPositions.filter(
      pos => pos.x !== nearestPlayerHead.x || pos.y !== nearestPlayerHead.y
    );
    const pathToPlayer = findPathToTarget(
      botHead,
      nearestPlayerHead,
      filteredPlayerPositions
    );
    if (pathToPlayer) {
      return pathToPlayer[1];
    }
  } else {
    const nearestResource = findNearestResource(botHead, resourcesList);
    if (!nearestResource) return null;

    const direction = findPathToTarget(
      botHead,
      nearestResource,
      playerPositions
    );

    if (direction) {
      return direction[1];
    } else {
      return null;
    }
  }
}

export { processAggressiveBot };

import { resources } from '../models/resources.js';
import { players } from '../models/players.js';
import { SEGMENT_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from '../../constants.js';
import { convertToGrid } from './gridConverter.js';
import { aStar, getDirectionFromPath } from './aStar.js';

// Process AI Bot based on its level and behavior type
function processAIBot(name, botConfig) {
  // Parse botLevel to extract difficulty and behavior
  let difficulty, behavior;

  if (typeof botConfig === 'string') {
    // Parse from format like "easy(Safe and Efficient)"
    const match = botConfig.match(/^(easy|medium|hard)\((.*?)\)$/);
    if (match) {
      difficulty = match[1];

      // Map the behavior string to our internal format
      const behaviorStr = match[2].toLowerCase();
      if (behaviorStr.includes('aggressive')) {
        behavior = 'aggressive';
      } else if (behaviorStr.includes('bold')) {
        behavior = 'boldAndFastPaced';
      } else {
        behavior = 'safeAndEfficient';
      }
    } else {
      console.error('Invalid bot level format:', botConfig);
      return null;
    }
  } else if (botConfig && typeof botConfig === 'object') {
    // Use the object format with level and behavior properties
    difficulty = botConfig.level;
    behavior = botConfig.behavior || 'safeAndEfficient';
  } else {
    console.error('Invalid bot configuration:', botConfig);
    return null;
  }

  // Call the appropriate behavior function
  switch (behavior) {
    case 'aggressive':
      return processAggressiveBot(name, difficulty);
    case 'boldAndFastPaced':
      return processBoldAndFastPacedBot(name, difficulty);
    case 'safeAndEfficient':
    default:
      return processSafeAndEfficientBot(name, difficulty);
  }
}

// Get the current bot player
function getBotPlayer(name) {
  return players.getPlayers().find(player => player.name === name);
}

// Find the nearest resource of specified types
function findNearestResource(
  botHead,
  resourceTypes = ['plain', 'speedup', 'slowdown', 'teleport']
) {
  const availableResources = resources
    .getResources()
    .filter(r => resourceTypes.includes(r.type));

  if (availableResources.length === 0) {
    return null;
  }

  return availableResources.reduce((nearest, resource) => {
    const distToNearest = calculateDistance(botHead, nearest);
    const distToCurrent = calculateDistance(botHead, resource);

    return distToCurrent < distToNearest ? resource : nearest;
  }, availableResources[0]);
}

// Calculate Manhattan distance between two points
function calculateDistance(pointA, pointB) {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

// Convert pixel position to grid position
function toGridPos(pos) {
  return {
    x: Math.floor(pos.x / SEGMENT_SIZE),
    y: Math.floor(pos.y / SEGMENT_SIZE),
  };
}

// Check if there's a player within proximity
function isPlayerInProximity(bot, proximityDistance = 7) {
  const botHead = bot.snake.lastConfirmedPosition.head;
  const botName = bot.name;

  const otherPlayers = players
    .getPlayers()
    .filter(p => p.name !== botName && p.isAlive);

  for (const player of otherPlayers) {
    const playerHead = player.snake.lastConfirmedPosition.head;
    const gridDistance = Math.floor(
      calculateDistance(botHead, playerHead) / SEGMENT_SIZE
    );

    if (gridDistance <= proximityDistance) {
      return {
        inProximity: true,
        player: player,
        distance: gridDistance,
      };
    }
  }

  return { inProximity: false };
}

// Get obstacles (snake bodies, etc.) for pathfinding
function getObstacles(avoidTypes = ['body', 'other-snake']) {
  const gridData = convertToGrid();
  const obstacles = [];

  // Add snake bodies to obstacles
  gridData.players.forEach(player => {
    // Add body segments
    if (avoidTypes.includes('body') || avoidTypes.includes('other-snake')) {
      player.body.forEach(segment => {
        obstacles.push(segment);
      });
    }

    // Add head of other snakes if needed
    if (avoidTypes.includes('other-snake')) {
      obstacles.push(player.head);
    }
  });

  // Add resources to avoid if needed
  if (avoidTypes.includes('teleport') || avoidTypes.includes('slowdown')) {
    gridData.resources.forEach(resource => {
      if (
        (avoidTypes.includes('teleport') && resource.type === 'teleport') ||
        (avoidTypes.includes('slowdown') && resource.type === 'slowdown')
      ) {
        obstacles.push({ x: resource.x, y: resource.y });
      }
    });
  }

  return obstacles;
}

// Find path to target using A* algorithm
function findPathToTarget(bot, target, avoidTypes) {
  // Safety checks
  if (
    !bot ||
    !bot.snake ||
    !bot.snake.lastConfirmedPosition ||
    !bot.snake.lastConfirmedPosition.head
  ) {
    return null;
  }

  if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
    return null;
  }

  const gridSize = {
    width: Math.ceil(BOARD_WIDTH / SEGMENT_SIZE),
    height: Math.ceil(BOARD_HEIGHT / SEGMENT_SIZE),
  };

  const botHead = bot.snake.lastConfirmedPosition.head;

  // Try direct approach first - simple and usually works
  const directDirection = calculateDirectApproach(botHead, target);
  if (directDirection) {
    return directDirection;
  }

  // Fall back to A* pathfinding
  const botHeadGrid = toGridPos(botHead);
  const targetGrid = toGridPos(target);

  const obstacles = getObstacles(avoidTypes);

  // Filter obstacles to avoid blocking own position
  const filteredObstacles = obstacles.filter(
    obs => !(obs.x === botHeadGrid.x && obs.y === botHeadGrid.y)
  );

  const path = aStar(gridSize, botHeadGrid, targetGrid, filteredObstacles);

  if (path && path.length > 1) {
    return getDirectionFromPath(botHeadGrid, path[1]);
  }

  // If all else fails, just pick a random safe direction
  return getRandomSafeDirection(bot, avoidTypes);
}

// Calculate the best direction to approach a target directly
function calculateDirectApproach(botHead, target) {
  const dx = target.x - botHead.x;
  const dy = target.y - botHead.y;

  // Determine primary direction by checking which axis has the larger distance
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'up' : 'down';
  }
}

// Get a random safe direction (avoid collisions)
function getRandomSafeDirection(bot, avoidTypes) {
  if (!bot || !bot.snake) return null;

  const currentDirection = bot.snake.direction;
  const possibleDirections = ['up', 'right', 'down', 'left'].filter(dir => {
    // Avoid 180-degree turns
    if (
      (currentDirection === 'up' && dir === 'down') ||
      (currentDirection === 'down' && dir === 'up') ||
      (currentDirection === 'left' && dir === 'right') ||
      (currentDirection === 'right' && dir === 'left')
    ) {
      return false;
    }

    return true;
  });

  return possibleDirections.length > 0
    ? possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
    : currentDirection;
}

//-------- Behaviors --------//

// Safe and Efficient Bot - Collects resources safely
function processSafeAndEfficientBot(name, difficulty) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;

  const botHead = bot.snake.lastConfirmedPosition.head;
  let resourceTypes = ['plain', 'speedup'];
  let avoidTypes = ['teleport', 'body'];

  // Adjust behavior based on difficulty
  switch (difficulty) {
    case 'easy':
      resourceTypes.push('slowdown');
      break;
    case 'medium':
      avoidTypes.push('slowdown', 'other-snake');
      break;
    case 'hard':
      avoidTypes.push('slowdown', 'other-snake');
      // If bot has speed boost, prioritize collecting plain resources
      if (bot.speedMultiplier > 1) {
        resourceTypes = ['plain', 'speedup'];
      } else {
        // Otherwise prioritize finding speed boost
        const speedBoost = findNearestResource(botHead, ['speedup']);
        if (speedBoost) {
          return findPathToTarget(bot, speedBoost, avoidTypes);
        }
        resourceTypes = ['plain'];
      }
      break;
  }

  const nearestResource = findNearestResource(botHead, resourceTypes);

  if (nearestResource) {
    return findPathToTarget(bot, nearestResource, avoidTypes);
  }

  return getRandomSafeDirection(bot, avoidTypes);
}

// Aggressive Bot - Attacks other snakes when they're close
function processAggressiveBot(name, difficulty) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;

  const botHead = bot.snake.lastConfirmedPosition.head;
  let proximityThreshold = 7; // Default for medium
  let resourceTypes = ['plain', 'speedup'];
  let avoidTypes = ['teleport', 'body'];

  // Adjust behavior based on difficulty
  switch (difficulty) {
    case 'easy':
      resourceTypes.push('slowdown');
      break;
    case 'medium':
      avoidTypes.push('slowdown', 'other-snake');
      break;
    case 'hard':
      avoidTypes.push('slowdown', 'other-snake');
      // If not in speed boost mode, seek speed boost first
      if (bot.speedMultiplier <= 1) {
        const speedBoost = findNearestResource(botHead, ['speedup']);
        if (speedBoost) {
          return findPathToTarget(bot, speedBoost, avoidTypes);
        }
      }

      // Always try to find and attack the closest player
      const otherPlayers = players
        .getPlayers()
        .filter(p => p.name !== bot.name && p.isAlive);

      if (otherPlayers.length > 0) {
        // Find the closest enemy
        const nearestEnemy = otherPlayers.reduce((nearest, player) => {
          const distToNearest = calculateDistance(
            botHead,
            nearest.snake.lastConfirmedPosition.head
          );
          const distToCurrent = calculateDistance(
            botHead,
            player.snake.lastConfirmedPosition.head
          );

          return distToCurrent < distToNearest ? player : nearest;
        }, otherPlayers[0]);

        // Attack the nearest enemy's head
        return findPathToTarget(
          bot,
          nearestEnemy.snake.lastConfirmedPosition.head,
          avoidTypes
        );
      }
      break;
  }

  // For easy and medium, only chase players within proximity
  if (difficulty !== 'hard') {
    const proximityCheck = isPlayerInProximity(bot, proximityThreshold);

    if (proximityCheck.inProximity) {
      // Chase the nearby player
      const targetPlayerHead =
        proximityCheck.player.snake.lastConfirmedPosition.head;
      return findPathToTarget(bot, targetPlayerHead, avoidTypes);
    }
  }

  // If not chasing anyone, collect resources
  const nearestResource = findNearestResource(botHead, resourceTypes);
  if (nearestResource) {
    return findPathToTarget(bot, nearestResource, avoidTypes);
  }

  return getRandomSafeDirection(bot, avoidTypes);
}

// Bold and Fast-Paced Bot - Prioritizes speed boosts and teleports
function processBoldAndFastPacedBot(name, difficulty) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;

  const botHead = bot.snake.lastConfirmedPosition.head;
  let priorityResources = [];
  let secondaryResources = [];
  let fallbackResources = [];
  let avoidTypes = [];

  // Adjust behavior based on difficulty
  switch (difficulty) {
    case 'easy':
      if (bot.speedMultiplier > 1) {
        // If already boosted, go for basic resources
        priorityResources = ['plain', 'speedup'];
      } else {
        // Otherwise, prioritize speed boosts
        priorityResources = ['speedup'];
        secondaryResources = ['plain'];
      }
      fallbackResources = ['slowdown'];
      break;

    case 'medium':
    case 'hard':
      priorityResources = ['teleport', 'speedup'];
      secondaryResources = ['plain'];
      fallbackResources = ['slowdown'];

      // Hard bots avoid other snakes
      if (difficulty === 'hard') {
        avoidTypes = ['body', 'other-snake'];
      }
      break;
  }

  // Try to find priority resources first
  const priorityResource = findNearestResource(botHead, priorityResources);
  if (priorityResource) {
    return findPathToTarget(bot, priorityResource, avoidTypes);
  }

  // Try secondary resources
  const secondaryResource = findNearestResource(botHead, secondaryResources);
  if (secondaryResource) {
    return findPathToTarget(bot, secondaryResource, avoidTypes);
  }

  // Last resort - fallback resources
  const fallbackResource = findNearestResource(botHead, fallbackResources);
  if (fallbackResource) {
    return findPathToTarget(bot, fallbackResource, avoidTypes);
  }

  return getRandomSafeDirection(bot, avoidTypes);
}

export { processAIBot };

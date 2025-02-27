import { resources } from '../models/resources.js';
import { players } from '../models/players.js';
import { SEGMENT_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from '../../constants.js';
import { convertToGrid } from './gridConverter.js';
import { aStar, getDirectionFromPath } from './aStar.js';

// Process AI Bot based on its level
function processAIBot(name, botLevel) {
  switch (botLevel) {
    case 'easy(Safe and Efficient)':
      return easySafeAndEfficient(name);
    case 'easy(Aggressive)':
      return easyAggressive(name);
    case 'easy(Bold and Fast-paced)':
      return easyBoldAndFastPaced(name);
    case 'medium(Safe and Efficient)':
      return mediumSafeAndEfficient(name);
    case 'medium(Aggressive)':
      return mediumAggressive(name);
    case 'medium(Bold and Fast-paced)':
      return mediumBoldAndFastPaced(name);
    case 'hard(Safe and Efficient)':
      return hardSafeAndEfficient(name);
    case 'hard(Aggressive)':
      return hardAggressive(name);
    case 'hard(Bold and Fast-paced)':
      return hardBoldAndFastPaced(name);
    default:
      throw new Error('invalid botLevel: ' + botLevel);
  }
}

// Get the current bot player
function getBotPlayer(name) {
  return players.getPlayers().find(player => player.name === name);
}

// Find the nearest resource of specified types
function findNearestResource(botHead, resourceTypes = ['plain', 'speedup', 'slowdown', 'teleport']) {
  const availableResources = resources.getResources().filter(r => resourceTypes.includes(r.type));
  
  if (availableResources.length === 0) {
    console.log(`No resources of types [${resourceTypes.join(', ')}] found`);
    return null;
  }
  
  // Check if there's a resource near the bot's current position first
  // Using a larger threshold to account for movement between frames
  const PROXIMITY_THRESHOLD = SEGMENT_SIZE * 1.5;
  const resourceAtCurrentPosition = availableResources.find(r => 
    Math.abs(r.x - botHead.x) < PROXIMITY_THRESHOLD && 
    Math.abs(r.y - botHead.y) < PROXIMITY_THRESHOLD
  );
  
  if (resourceAtCurrentPosition) {
    console.log(`Bot is already at/near resource of type ${resourceAtCurrentPosition.type}`);
    return resourceAtCurrentPosition;
  }
  
  // Sort resources by distance for better selection
  const sortedResources = [...availableResources].sort((a, b) => {
    const distA = calculateDistance(botHead, a);
    const distB = calculateDistance(botHead, b);
    return distA - distB;
  });
  
  // Take the closest resource
  const nearestResource = sortedResources[0];
  
  console.log(`Nearest resource found: ${nearestResource.type} at (${nearestResource.x}, ${nearestResource.y}), distance: ${calculateDistance(botHead, nearestResource)}`);
  return nearestResource;
}

// Calculate Manhattan distance between two points
function calculateDistance(pointA, pointB) {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

// Convert pixel position to grid position
function toGridPos(pos) {
  return {
    x: Math.floor(pos.x / SEGMENT_SIZE),
    y: Math.floor(pos.y / SEGMENT_SIZE)
  };
}

// Debug function to log positions
function logPositions(botName, botHead, target, gridBotHead, gridTarget) {
  console.log(`[DEBUG] ${botName} Bot:`, {
    botHead: `(${botHead.x}, ${botHead.y})`,
    target: `(${target.x}, ${target.y})`,
    gridBotHead: `(${gridBotHead.x}, ${gridBotHead.y})`,
    gridTarget: `(${gridTarget.x}, ${gridTarget.y})`,
    distance: calculateDistance(botHead, target)
  });
}

// Check if a player is in proximity
function isPlayerInProximity(bot, proximityDistance) {
  const botHead = bot.snake.lastConfirmedPosition.head;
  const botName = bot.name;
  
  const otherPlayers = players.getPlayers().filter(p => 
    p.name !== botName && p.isAlive
  );
  
  for (const player of otherPlayers) {
    const playerHead = player.snake.lastConfirmedPosition.head;
    const distance = calculateDistance(botHead, playerHead) / SEGMENT_SIZE;
    
    if (distance <= proximityDistance) {
      console.log(`[DEBUG] ${botName} detected player ${player.name} at distance ${distance}`);
      return {
        inProximity: true,
        player: player
      };
    }
  }
  
  return { inProximity: false };
}

// Get obstacles (snake bodies, etc.) for pathfinding
function getObstacles(avoidTypes = ['body', 'other-snake', 'teleport', 'slowdown']) {
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
      if ((avoidTypes.includes('teleport') && resource.type === 'teleport') ||
          (avoidTypes.includes('slowdown') && resource.type === 'slowdown')) {
        obstacles.push({ x: resource.x, y: resource.y });
      }
    });
  }
  
  return obstacles;
}

// Find a path to the target
function findPathToTarget(bot, target, avoidTypes) {
  // Safety checks for bot and target
  if (!bot || !bot.snake || !bot.snake.lastConfirmedPosition || !bot.snake.lastConfirmedPosition.head) {
    console.log(`[ERROR] Invalid bot in findPathToTarget`);
    return null;
  }
  
  if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
    console.log(`[ERROR] Invalid target in findPathToTarget`);
    return null;
  }
  
  const gridSize = { 
    width: Math.ceil(BOARD_WIDTH / SEGMENT_SIZE), 
    height: Math.ceil(BOARD_HEIGHT / SEGMENT_SIZE) 
  };
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  
  // Use a larger threshold to account for movement between frames
  // and to make it easier to collect resources
  const PROXIMITY_THRESHOLD = SEGMENT_SIZE * 1.2;
  const closeToTarget = Math.abs(botHead.x - target.x) < PROXIMITY_THRESHOLD && 
                        Math.abs(botHead.y - target.y) < PROXIMITY_THRESHOLD;
  
  if (closeToTarget) {
    console.log(`[DEBUG] ${bot.name} is very close to the target!`);
    
    // Move directly toward the resource for precision
    const dx = target.x - botHead.x;
    const dy = target.y - botHead.y;
    
    // Choose the most significant axis for movement
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'up' : 'down';
    }
  }
  
  // Try direct approach first - it's faster and often works well enough
  const directApproach = calculateDirectApproach(bot, target, bot.snake.direction);
  if (directApproach) {
    console.log(`[DEBUG] ${bot.name} using direct approach: ${directApproach}`);
    return directApproach;
  }
  
  // Fall back to A* pathfinding as a last resort
  const botHeadGrid = toGridPos(botHead);
  const targetGrid = toGridPos(target);
  
  logPositions(bot.name, botHead, target, botHeadGrid, targetGrid);
  
  // Get obstacle list, but make sure we're not blocking our own position or target
  const obstacles = getObstacles(avoidTypes);
  console.log(`[DEBUG] ${bot.name} has ${obstacles.length} obstacles to avoid`);
  
  // Filter obstacles to avoid blocking our path
  const filteredObstacles = obstacles.filter(obs => 
    !(obs.x === botHeadGrid.x && obs.y === botHeadGrid.y) && 
    !(obs.x === targetGrid.x && obs.y === targetGrid.y)
  );
  
  // Try pathfinding
  const path = aStar(gridSize, botHeadGrid, targetGrid, filteredObstacles);
  
  if (path && path.length > 1) {
    const direction = getDirectionFromPath(botHeadGrid, path[1]);
    console.log(`[DEBUG] ${bot.name} A* path found, moving ${direction}`);
    return direction;
  }
  
  // If all else fails, just pick a safe random direction
  console.log(`[DEBUG] ${bot.name} no path found, using random direction`);
  return getRandomSafeDirection(bot, avoidTypes);
}

// Calculate a direct approach to target without using A*
function calculateDirectApproach(bot, target, currentDirection) {
  // Safety check: Make sure bot and its properties are defined
  if (!bot || !bot.snake || !bot.snake.lastConfirmedPosition || !bot.snake.lastConfirmedPosition.head) {
    console.log(`[ERROR] Invalid bot object in calculateDirectApproach`);
    return null;
  }
  
  // Safety check: Make sure target is defined
  if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
    console.log(`[ERROR] Invalid target in calculateDirectApproach`);
    return null;
  }
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  const dx = target.x - botHead.x;
  const dy = target.y - botHead.y;
  
  // Get all possible directions that don't cause immediate collisions
  const safeDirections = getSafeDirections(bot);
  
  // If no safe directions, return null to trigger fallback behavior
  if (safeDirections.length === 0) {
    console.log(`[DEBUG] ${bot.name} No safe directions for direct approach`);
    return null;
  }
  
  // Decide direction based on which axis has the larger difference
  let preferredDirections = [];
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal movement is preferred
    if (dx > 0 && safeDirections.includes('right')) {
      preferredDirections.push('right');
    } else if (dx < 0 && safeDirections.includes('left')) {
      preferredDirections.push('left');
    }
    
    // Add vertical options as fallbacks
    if (dy > 0 && safeDirections.includes('up')) {
      preferredDirections.push('up');
    } else if (dy < 0 && safeDirections.includes('down')) {
      preferredDirections.push('down');
    }
  } else {
    // Vertical movement is preferred
    if (dy > 0 && safeDirections.includes('up')) {
      preferredDirections.push('up');
    } else if (dy < 0 && safeDirections.includes('down')) {
      preferredDirections.push('down');
    }
    
    // Add horizontal options as fallbacks
    if (dx > 0 && safeDirections.includes('right')) {
      preferredDirections.push('right');
    } else if (dx < 0 && safeDirections.includes('left')) {
      preferredDirections.push('left');
    }
  }
  
  // If we have at least one preferred direction, use the first (most preferred)
  if (preferredDirections.length > 0) {
    console.log(`[DEBUG] ${bot.name} direct approach, choosing: ${preferredDirections[0]} from ${preferredDirections.join(',')}`);
    return preferredDirections[0];
  }
  
  // If no preferred directions align with our target, just pick a safe direction
  console.log(`[DEBUG] ${bot.name} No aligned directions, using any safe direction: ${safeDirections[0]}`);
  return safeDirections[0];
}

// Get all directions that are safe to move in (no collisions)
function getSafeDirections(bot) {
  // Safety check: Make sure bot and its properties are defined
  if (!bot || !bot.snake || !bot.snake.lastConfirmedPosition || 
      !bot.snake.lastConfirmedPosition.head || !bot.snake.lastConfirmedPosition.body) {
    console.log(`[ERROR] Invalid bot object in getSafeDirections`);
    return [];
  }
  
  const currentDirection = bot.snake.direction;
  const botName = bot.name;
  const head = bot.snake.lastConfirmedPosition.head;
  const body = bot.snake.lastConfirmedPosition.body;
  
  // All body parts as grid coordinates for collision detection
  const bodyGrid = body.map(segment => toGridPos(segment));
  
  return ['up', 'right', 'down', 'left'].filter(dir => {
    // Avoid 180-degree turns
    if ((currentDirection === 'up' && dir === 'down') ||
        (currentDirection === 'down' && dir === 'up') ||
        (currentDirection === 'left' && dir === 'right') ||
        (currentDirection === 'right' && dir === 'left')) {
      return false;
    }
    
    // Calculate the next position if moving in this direction
    const nextPos = { ...head };
    
    switch (dir) {
      case 'up': nextPos.y += SEGMENT_SIZE; break;
      case 'down': nextPos.y -= SEGMENT_SIZE; break;
      case 'left': nextPos.x -= SEGMENT_SIZE; break;
      case 'right': nextPos.x += SEGMENT_SIZE; break;
    }
    
    // Check for boundary collision
    if (nextPos.x < 0 || nextPos.x >= BOARD_WIDTH || 
        nextPos.y < 0 || nextPos.y >= BOARD_HEIGHT) {
      return false;
    }
    
    // Check for body collision
    const nextPosGrid = toGridPos(nextPos);
    
    // Check for collision with own body
    const bodyCollision = bodyGrid.some(segment => 
      segment.x === nextPosGrid.x && segment.y === nextPosGrid.y
    );
    
    if (bodyCollision) {
      console.log(`[DEBUG] ${botName} Direction ${dir} would hit own body`);
      return false;
    }
    
    // Check for other players
    const otherPlayers = players.getPlayers().filter(p => p.name !== botName && p.isAlive);
    
    for (const player of otherPlayers) {
      const enemyHead = toGridPos(player.snake.lastConfirmedPosition.head);
      if (enemyHead.x === nextPosGrid.x && enemyHead.y === nextPosGrid.y) {
        console.log(`[DEBUG] ${botName} Direction ${dir} would hit enemy head`);
        return false;
      }
      
      const enemyBody = player.snake.lastConfirmedPosition.body.map(segment => toGridPos(segment));
      const enemyBodyCollision = enemyBody.some(segment => 
        segment.x === nextPosGrid.x && segment.y === nextPosGrid.y
      );
      
      if (enemyBodyCollision) {
        console.log(`[DEBUG] ${botName} Direction ${dir} would hit enemy body`);
        return false;
      }
    }
    
    return true;
  });
}

// Get a random direction that doesn't lead to immediate collision
function getRandomSafeDirection(bot, avoidTypes) {
  // Safety check: Make sure bot and its properties are defined
  if (!bot || !bot.snake || !bot.name) {
    console.log(`[ERROR] Invalid bot object in getRandomSafeDirection`);
    return null;
  }
  
  const currentDirection = bot.snake.direction;
  console.log(`[DEBUG] ${bot.name} finding random safe direction, current: ${currentDirection}`);
  
  // Simply use our new comprehensive safety check from getSafeDirections
  const safeDirections = getSafeDirections(bot);
  
  if (safeDirections.length === 0) {
    console.log(`[DEBUG] ${bot.name} No safe direction found, keeping current direction: ${currentDirection}`);
    return currentDirection;
  }
  
  const chosenDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
  console.log(`[DEBUG] ${bot.name} choosing random safe direction: ${chosenDirection}`);
  return chosenDirection;
}

// Easy Safe and Efficient Bot
// Eats basic, speed boost, and slow down resources, avoids teleport
function easySafeAndEfficient(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  console.log(`[DEBUG] Processing easySafeAndEfficient bot: ${name}`);
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  const nearestResource = findNearestResource(botHead, ['plain', 'speedup', 'slowdown']);
  
  if (nearestResource) {
    // Use direct approach first for simplicity
    const directDirection = calculateDirectApproach(bot, nearestResource, bot.snake.direction);
    if (directDirection) {
      console.log(`[DEBUG] ${name} using direct approach to resource: ${directDirection}`);
      return directDirection;
    }
    
    const pathDirection = findPathToTarget(bot, nearestResource, ['teleport']);
    if (pathDirection) {
      return pathDirection;
    }
  }
  
  return getRandomSafeDirection(bot, ['teleport']);
}

// Medium Safe and Efficient Bot
// Eats basic and speed boost resources, avoids teleport, slow down, other snakes and own body
function mediumSafeAndEfficient(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  console.log(`[DEBUG] Processing mediumSafeAndEfficient bot: ${name}`);
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  const nearestResource = findNearestResource(botHead, ['plain', 'speedup']);
  
  if (nearestResource) {
    // Use direct approach first for simplicity
    const directDirection = calculateDirectApproach(bot, nearestResource, bot.snake.direction);
    if (directDirection) {
      console.log(`[DEBUG] ${name} using direct approach to resource: ${directDirection}`);
      return directDirection;
    }
    
    const pathDirection = findPathToTarget(bot, nearestResource, ['teleport', 'slowdown', 'body', 'other-snake']);
    if (pathDirection) {
      return pathDirection;
    }
  }
  
  return getRandomSafeDirection(bot, ['teleport', 'slowdown', 'body', 'other-snake']);
}

// Hard Safe and Efficient Bot
// Eats speed boost then basic resources when speed boost is active, otherwise only eats basic resources
// Avoids teleport, slow down, other snakes and own body
function hardSafeAndEfficient(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  console.log(`[DEBUG] Processing hardSafeAndEfficient bot: ${name}`);
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  let targetResourceTypes = ['plain'];
  
  // If speed multiplier is more than 1, bot is in speed boost mode
  if (bot.speedMultiplier > 1) {
    console.log(`[DEBUG] ${name} is in speed boost mode`);
    targetResourceTypes = ['plain', 'speedup'];
  } else {
    // Look for speed boost first
    const speedBoost = findNearestResource(botHead, ['speedup']);
    if (speedBoost) {
      // Use direct approach first for simplicity
      const directDirection = calculateDirectApproach(bot, speedBoost, bot.snake.direction);
      if (directDirection) {
        console.log(`[DEBUG] ${name} using direct approach to speed boost: ${directDirection}`);
        return directDirection;
      }
      
      const pathDirection = findPathToTarget(bot, speedBoost, ['teleport', 'slowdown', 'body', 'other-snake']);
      if (pathDirection) {
        return pathDirection;
      }
    }
  }
  
  const nearestResource = findNearestResource(botHead, targetResourceTypes);
  
  if (nearestResource) {
    // Use direct approach first for simplicity
    const directDirection = calculateDirectApproach(bot, nearestResource, bot.snake.direction);
    if (directDirection) {
      console.log(`[DEBUG] ${name} using direct approach to resource: ${directDirection}`);
      return directDirection;
    }
    
    const pathDirection = findPathToTarget(bot, nearestResource, ['teleport', 'slowdown', 'body', 'other-snake']);
    if (pathDirection) {
      return pathDirection;
    }
  }
  
  return getRandomSafeDirection(bot, ['teleport', 'slowdown', 'body', 'other-snake']);
}

// Easy Aggressive Bot
// Eats basic, speed boost, and slow down resources, avoids teleport
// Tracks other snake heads when they are within 5 grid cells
function easyAggressive(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  console.log(`[DEBUG] Processing easyAggressive bot: ${name}`);
  
  // Check if any player is in proximity (5 grid cells)
  const proximityCheck = isPlayerInProximity(bot, 5);
  
  if (proximityCheck.inProximity) {
    // Chase the nearby player
    const targetPlayerHead = proximityCheck.player.snake.lastConfirmedPosition.head;
    console.log(`[DEBUG] ${name} chasing player at (${targetPlayerHead.x}, ${targetPlayerHead.y})`);
    
    // Use direct approach for aggressive behavior
    const directDirection = calculateDirectApproach(bot, targetPlayerHead, bot.snake.direction);
    
    if (directDirection) {
      console.log(`[DEBUG] ${name} direct chase: ${directDirection}`);
      return directDirection;
    }
    
    return findPathToTarget(bot, targetPlayerHead, ['teleport']);
  }
  
  // No players nearby, go for resources
  const botHead = bot.snake.lastConfirmedPosition.head;
  const nearestResource = findNearestResource(botHead, ['plain', 'speedup', 'slowdown']);
  
  if (nearestResource) {
    return findPathToTarget(bot, nearestResource, ['teleport']);
  }
  
  return getRandomSafeDirection(bot, ['teleport']);
}

// Medium Aggressive Bot
// Eats basic and speed boost resources, avoids teleport
// Tracks other snake heads when they are within 7 grid cells
function mediumAggressive(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  console.log(`[DEBUG] Processing mediumAggressive bot: ${name}`);
  
  // Check if any player is in proximity (7 grid cells)
  const proximityCheck = isPlayerInProximity(bot, 7);
  
  if (proximityCheck.inProximity) {
    // Chase the nearby player
    const targetPlayerHead = proximityCheck.player.snake.lastConfirmedPosition.head;
    console.log(`[DEBUG] ${name} chasing player at (${targetPlayerHead.x}, ${targetPlayerHead.y})`);
    
    // Use direct approach for aggressive behavior
    const directDirection = calculateDirectApproach(bot, targetPlayerHead, bot.snake.direction);
    
    if (directDirection) {
      console.log(`[DEBUG] ${name} direct chase: ${directDirection}`);
      return directDirection;
    }
    
    return findPathToTarget(bot, targetPlayerHead, ['teleport']);
  }
  
  // No players nearby, go for resources
  const botHead = bot.snake.lastConfirmedPosition.head;
  const nearestResource = findNearestResource(botHead, ['plain', 'speedup']);
  
  if (nearestResource) {
    return findPathToTarget(bot, nearestResource, ['teleport']);
  }
  
  return getRandomSafeDirection(bot, ['teleport']);
}

// Hard Aggressive Bot
// Goes for speed boost first, then charges at the nearest enemy
// Avoids slow down resources and body collisions while attacking
function hardAggressive(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  console.log(`[DEBUG] Processing hardAggressive bot: ${name}`);
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  
  // If not in speed boost mode, seek speed boost
  if (bot.speedMultiplier <= 1) {
    const speedBoost = findNearestResource(botHead, ['speedup']);
    if (speedBoost) {
      // Use direct approach first for simplicity
      const directDirection = calculateDirectApproach(botHead, speedBoost, bot.snake.direction);
      if (directDirection) {
        console.log(`[DEBUG] ${name} using direct approach to speed boost: ${directDirection}`);
        return directDirection;
      }
      
      return findPathToTarget(bot, speedBoost, ['slowdown', 'body']);
    }
  }
  
  // Find the nearest player to attack
  const otherPlayers = players.getPlayers().filter(p => 
    p.name !== bot.name && p.isAlive
  );
  
  if (otherPlayers.length > 0) {
    // Find the closest enemy
    const nearestEnemy = otherPlayers.reduce((nearest, player) => {
      const distToNearest = calculateDistance(botHead, nearest.snake.lastConfirmedPosition.head);
      const distToCurrent = calculateDistance(botHead, player.snake.lastConfirmedPosition.head);
      
      return distToCurrent < distToNearest ? player : nearest;
    }, otherPlayers[0]);
    
    const enemyHead = nearestEnemy.snake.lastConfirmedPosition.head;
    console.log(`[DEBUG] ${name} targeting enemy ${nearestEnemy.name} at (${enemyHead.x}, ${enemyHead.y})`);
    
    // Use direct approach for aggressive behavior
    const directDirection = calculateDirectApproach(bot, enemyHead, bot.snake.direction);
    if (directDirection) {
      console.log(`[DEBUG] ${name} direct aggression: ${directDirection}`);
      return directDirection;
    }
    
    // Attack the nearest enemy's head
    return findPathToTarget(bot, enemyHead, ['slowdown', 'body']);
  }
  
  // No other players, just go for regular resources
  const nearestResource = findNearestResource(botHead, ['plain', 'speedup']);
  
  if (nearestResource) {
    // Use direct approach first for simplicity
    const directDirection = calculateDirectApproach(bot, nearestResource, bot.snake.direction);
    if (directDirection) {
      console.log(`[DEBUG] ${name} using direct approach to resource: ${directDirection}`);
      return directDirection;
    }
    
    return findPathToTarget(bot, nearestResource, ['slowdown', 'body']);
  }
  
  return getRandomSafeDirection(bot, ['slowdown', 'body']);
}

// Easy Bold and Fast-Paced Bot
// Prioritizes speed boost, then eats basic resources when speed boosted
// Falls back to slow down resources if nothing else available
// Doesn't avoid other snakes
function easyBoldAndFastPaced(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  
  // If in speed boost mode, go for basic resources
  if (bot.speedMultiplier > 1) {
    const basicResource = findNearestResource(botHead, ['plain', 'speedup']);
    if (basicResource) {
      return findPathToTarget(bot, basicResource, []);
    }
  } else {
    // Not in speed boost mode, prioritize speed boost
    const speedBoost = findNearestResource(botHead, ['speedup']);
    if (speedBoost) {
      return findPathToTarget(bot, speedBoost, []);
    }
  }
  
  // Fall back to any resource, including slow down
  const anyResource = findNearestResource(botHead, ['plain', 'speedup', 'slowdown']);
  
  if (anyResource) {
    return findPathToTarget(bot, anyResource, []);
  }
  
  return getRandomSafeDirection(bot, []);
}

// Medium Bold and Fast-Paced Bot
// Prioritizes teleport and speed boost, then basic resources, finally slow down
// Doesn't avoid other snakes
function mediumBoldAndFastPaced(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  
  // First priority: teleport and speed boost
  const priorityResource = findNearestResource(botHead, ['teleport', 'speedup']);
  if (priorityResource) {
    return findPathToTarget(bot, priorityResource, []);
  }
  
  // Second priority: basic resources
  const basicResource = findNearestResource(botHead, ['plain']);
  if (basicResource) {
    return findPathToTarget(bot, basicResource, []);
  }
  
  // Last resort: slow down resources
  const slowDownResource = findNearestResource(botHead, ['slowdown']);
  if (slowDownResource) {
    return findPathToTarget(bot, slowDownResource, []);
  }
  
  return getRandomSafeDirection(bot, []);
}

// Hard Bold and Fast-Paced Bot
// Prioritizes teleport and speed boost, then basic resources, finally slow down
// Avoids other snakes while going for resources
function hardBoldAndFastPaced(name) {
  const bot = getBotPlayer(name);
  if (!bot || !bot.isAlive) return null;
  
  const botHead = bot.snake.lastConfirmedPosition.head;
  
  // First priority: teleport and speed boost
  const priorityResource = findNearestResource(botHead, ['teleport', 'speedup']);
  if (priorityResource) {
    return findPathToTarget(bot, priorityResource, ['body', 'other-snake']);
  }
  
  // Second priority: basic resources
  const basicResource = findNearestResource(botHead, ['plain']);
  if (basicResource) {
    return findPathToTarget(bot, basicResource, ['body', 'other-snake']);
  }
  
  // Last resort: slow down resources
  const slowDownResource = findNearestResource(botHead, ['slowdown']);
  if (slowDownResource) {
    return findPathToTarget(bot, slowDownResource, ['body', 'other-snake']);
  }
  
  return getRandomSafeDirection(bot, ['body', 'other-snake']);
}

export { processAIBot };
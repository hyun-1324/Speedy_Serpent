import { calculateDistance } from './botUtils.js';

// A* Pathfinding algorithm
function findPathToTarget(start, goal, obstacles, maxIterations = 1000) {
  // If start and goal are the same position, return a simple path
  if (start.x === goal.x && start.y === goal.y) {
    return null;
  }

  // Define directions: up, right, down, left
  const directions = [
    { x: 0, y: 18 }, // up
    { x: 18, y: 0 }, // right
    { x: 0, y: -18 }, // down
    { x: -18, y: 0 }, // left
  ];

  // Create open and closed sets
  const openSet = [start];
  const closedSet = [];

  // Track costs and paths
  const gScore = {}; // Cost from start to current node
  const fScore = {}; // Estimated total cost from start to goal through current node
  const cameFrom = {}; // To reconstruct the path

  // Initialize scores
  gScore[`${start.x},${start.y}`] = 0;
  fScore[`${start.x},${start.y}`] = calculateDistance(start, goal);

  let iterations = 0;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with lowest fScore in openSet
    let current = openSet.reduce((lowest, node) => {
      return fScore[`${node.x},${node.y}`] < fScore[`${lowest.x},${lowest.y}`]
        ? node
        : lowest;
    }, openSet[0]);

    // If we've reached the goal, reconstruct and return the path
    if (current.x === goal.x && current.y === goal.y) {
      const path = reconstructPath(cameFrom, current);
      return path;
    }

    // Move current from openSet to closedSet
    openSet.splice(
      openSet.findIndex(node => node.x === current.x && node.y === current.y),
      1
    );
    closedSet.push(current);

    // Check each neighbor
    for (const dir of directions) {
      const neighbor = {
        x: current.x + dir.x,
        y: current.y + dir.y,
      };

      // Check if neighbor is in obstacles
      if (obstacles.some(obs => obs.x === neighbor.x && obs.y === neighbor.y)) {
        continue;
      }

      // Check if neighbor is in closedSet
      if (
        closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)
      ) {
        continue;
      }

      // Calculate tentative gScore
      const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
      const neighborKey = `${neighbor.x},${neighbor.y}`;

      // If neighbor is not in openSet, add it
      const inOpenSet = openSet.some(
        node => node.x === neighbor.x && node.y === neighbor.y
      );
      if (!inOpenSet) {
        openSet.push(neighbor);
      }
      // If this path to neighbor is not better, skip
      else if (tentativeGScore >= (gScore[neighborKey] || Infinity)) {
        continue;
      }

      // This path is the best so far, record it
      cameFrom[neighborKey] = current;
      gScore[neighborKey] = tentativeGScore;
      fScore[neighborKey] =
        gScore[neighborKey] + calculateDistance(neighbor, goal);
    }
  }

  return null;
}

// Reconstruct path from start to goal
function reconstructPath(cameFrom, current) {
  const path = [current];

  while (cameFrom[`${current.x},${current.y}`]) {
    current = cameFrom[`${current.x},${current.y}`];
    path.unshift(current);
  }

  return path;
}

export { findPathToTarget };

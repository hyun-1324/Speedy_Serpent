// A* Pathfinding algorithm
function aStar(grid, start, goal, obstacles = [], maxIterations = 1000) {
  // Log start and goal positions for debugging
  console.log(`A* search from (${start.x},${start.y}) to (${goal.x},${goal.y})`);
  
  // If goal is in obstacles, find the closest non-obstacle position
  if (obstacles.some(obs => obs.x === goal.x && obs.y === goal.y)) {
    console.log("Goal is in obstacles, cannot reach exact target");
    return null;
  }
  
  // If start and goal are the same position, return a simple path
  if (start.x === goal.x && start.y === goal.y) {
    console.log("Start and goal are the same position");
    return [start, start]; // Return a path with just the current position duplicated
  }

  // Define directions: up, right, down, left
  const directions = [
    { x: 0, y: 1 },  // up
    { x: 1, y: 0 },  // right
    { x: 0, y: -1 }, // down
    { x: -1, y: 0 }, // left
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
  fScore[`${start.x},${start.y}`] = heuristic(start, goal);
  
  let iterations = 0;
  
  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest fScore in openSet
    let current = openSet.reduce((lowest, node) => {
      return fScore[`${node.x},${node.y}`] < fScore[`${lowest.x},${lowest.y}`] ? node : lowest;
    }, openSet[0]);
    
    // If we've reached the goal, reconstruct and return the path
    if (current.x === goal.x && current.y === goal.y) {
      const path = reconstructPath(cameFrom, current);
      console.log(`Path found in ${iterations} iterations with length ${path.length}`);
      return path;
    }
    
    // Move current from openSet to closedSet
    openSet.splice(openSet.findIndex(node => node.x === current.x && node.y === current.y), 1);
    closedSet.push(current);
    
    // Check each neighbor
    for (const dir of directions) {
      const neighbor = {
        x: current.x + dir.x,
        y: current.y + dir.y
      };
      
      // Check if neighbor is within grid bounds
      if (neighbor.x < 0 || neighbor.x >= grid.width || 
          neighbor.y < 0 || neighbor.y >= grid.height) {
        continue;
      }
      
      // Check if neighbor is in obstacles
      if (obstacles.some(obs => obs.x === neighbor.x && obs.y === neighbor.y)) {
        continue;
      }
      
      // Check if neighbor is in closedSet
      if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
        continue;
      }
      
      // Calculate tentative gScore
      const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      // If neighbor is not in openSet, add it
      const inOpenSet = openSet.some(node => node.x === neighbor.x && node.y === neighbor.y);
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
      fScore[neighborKey] = gScore[neighborKey] + heuristic(neighbor, goal);
    }
  }
  
  // No path found, return the closest path we found
  console.log(`No path found after ${iterations} iterations`);
  
  // Try to find the closest approach we managed
  if (closedSet.length > 0) {
    const closest = closedSet.reduce((best, node) => {
      const distBest = heuristic(best, goal);
      const distCurrent = heuristic(node, goal);
      return distCurrent < distBest ? node : best;
    }, closedSet[0]);
    
    // If we found a reasonably close node, return a path to it
    if (heuristic(closest, goal) < heuristic(start, goal)) {
      console.log(`Returning path to closest approach: (${closest.x},${closest.y})`);
      return reconstructPath(cameFrom, closest);
    }
  }
  
  // No useful path found at all
  return null;
}

// Manhattan distance heuristic
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
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

// Get the direction to move based on current position and next position
function getDirectionFromPath(current, next) {
  // Convert to integer to handle potential floating-point issues
  const curX = Math.round(current.x);
  const curY = Math.round(current.y);
  const nextX = Math.round(next.x);
  const nextY = Math.round(next.y);
  
  console.log(`Determining direction from (${curX},${curY}) to (${nextX},${nextY})`);
  
  // Calculate differences
  const dx = nextX - curX;
  const dy = nextY - curY;
  
  // If the difference is more significant in X-axis
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } 
  // If the difference is more significant in Y-axis or equal
  else {
    return dy > 0 ? 'up' : 'down';
  }
}

export { aStar, getDirectionFromPath };
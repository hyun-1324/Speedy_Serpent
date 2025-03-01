const difficultyProbabilities = {
  easy: 0.9,
  medium: 0.6,
  hard: 0.1,
};

function getNextGrid(head, direction) {
  switch (direction) {
    case 'up':
      return { x: head.x, y: head.y + 18 };
    case 'down':
      return { x: head.x, y: head.y - 18 };
    case 'left':
      return { x: head.x - 18, y: head.y };
    case 'right':
      return { x: head.x + 18, y: head.y };
  }
}

function skipTurn(bot) {
  let skip = false;

  switch (bot.botLevel) {
    case 'easy':
      if (Math.random() > 0.9) skip = true;
      break;
    case 'medium':
      if (Math.random() > 0.95) skip = true;
      break;
    case 'hard':
      if (Math.random() > 1) skip = true;
      break;
  }

  return skip;
}

function findNearestResource(botHead, resources) {
  return resources.reduce((nearest, resource) => {
    const distToNearest = calculateDistance(botHead, nearest);
    const distToCurrent = calculateDistance(botHead, resource);

    return distToCurrent < distToNearest ? resource : nearest;
  }, resources[0]);
}

function findNearestSelectedResource(botHead, resourcesList, type) {
  const selectedResourceList = resourcesList.filter(r => type.includes(r.type));

  return findNearestResource(botHead, selectedResourceList);
}

function getDirectionFromGrid(from, to) {
  if (!to || !from) return null;
  if (from.x === to.x && from.y < to.y) return 'up';
  if (from.x === to.x && from.y > to.y) return 'down';
  if (from.x > to.x && from.y === to.y) return 'left';
  if (from.x < to.x && from.y === to.y) return 'right';
}

function calculateDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(position, occupiedPositions) {
  const directions = [
    { x: 0, y: 18 }, // up
    { x: 18, y: 0 }, // right
    { x: 0, y: -18 }, // down
    { x: -18, y: 0 }, // left
  ];

  return directions
    .map(dir => ({ x: position.x + dir.x, y: position.y + dir.y }))
    .filter(
      pos =>
        pos.x >= 0 &&
        pos.x <= 576 &&
        pos.y >= 0 &&
        pos.y <= 468 &&
        !occupiedPositions.some(occ => occ.x === pos.x && occ.y === pos.y)
    );
}

export {
  difficultyProbabilities,
  getNextGrid,
  skipTurn,
  findNearestResource,
  getDirectionFromGrid,
  calculateDistance,
  getNeighbors,
  findNearestSelectedResource,
};

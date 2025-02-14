import { players } from '../models/players.js';
import { resources } from '../models/resources.js';
import { applyResourceEffect } from './resourceUtils.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../constants.js';

const checkWallCollision = position => {
  return (
    position.x < 0 ||
    position.x > BOARD_WIDTH ||
    position.y < 0 ||
    position.y > BOARD_HEIGHT
  );
};

const checkSnakeCollisions = (currentPlayer, allPlayers, collisionEvents) => {
  const head = currentPlayer.snake.predictedPosition.head;

  return allPlayers.some(otherPlayer => {
    if (!otherPlayer.isAlive || otherPlayer.name === currentPlayer.name) {
      return false;
    }

    // Check collision with other snake's head
    if (
      head.x === otherPlayer.snake.predictedPosition.head.x &&
      head.y === otherPlayer.snake.predictedPosition.head.y
    ) {
      otherPlayer.isAlive = false;

      collisionEvents.push({
        playerName: otherPlayer.name,
        type: { collision: true, type: 'snake' },
      });

      return true;
    }

    // Check collision with other snake's body
    return otherPlayer.snake.predictedPosition.body.some(
      segment => head.x === segment.x && head.y === segment.y
    );
  });
};

const checkSelfCollision = player => {
  const head = player.snake.predictedPosition.head;
  return player.snake.predictedPosition.body.some(
    segment => head.x === segment.x && head.y === segment.y
  );
};

const checkResourceCollision = player => {
  const head = player.snake.predictedPosition.head;
  const collidedResource = resources
    .getResources()
    .find(r => r.x === head.x && r.y === head.y);

  if (collidedResource) {
    applyResourceEffect(player, collidedResource);
    return collidedResource;
  }

  return false;
};

const handleCollisions = (player, collisionEvents) => {
  if (checkWallCollision(player.snake.predictedPosition.head)) {
    player.isAlive = false;
    return { collision: true, type: 'wall' };
  }

  if (checkSelfCollision(player)) {
    player.isAlive = false;
    return { collision: true, type: 'self' };
  }

  if (checkSnakeCollisions(player, players.getPlayers(), collisionEvents)) {
    player.isAlive = false;
    return { collision: true, type: 'snake' };
  }

  const resource = checkResourceCollision(player);
  if (resource) {
    return { type: resource.type, x: resource.x, y: resource.y };
  }

  return { collision: false, type: null };
};

export {
  checkWallCollision,
  checkSnakeCollisions,
  checkSelfCollision,
  handleCollisions,
};

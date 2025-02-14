import { SEGMENT_SIZE, BOARD_HEIGHT, BOARD_WIDTH } from '../../constants.js';
import { resources } from '../models/resources.js';
import { gameState } from '../app.mjs';

function applyResourceEffect(player, resource) {
  switch (resource.type) {
    case 'plain':
      player.score += resource.score;
      player.plainCounter++;

      if (player.plainCounter >= 3) {
        addSnakeSegment(player);
        player.plainCounter = 0;
      }
      break;

    case 'slowdown':
    case 'speedup':
      player.score += resource.score;

      if (player.speedEffectTimer) {
        clearInterval(player.speedEffectTimer);
      }

      player.remainingBuffDuration = resource.duration;

      const updateBuffDuration = () => {
        if (!gameState.getPaused()) {
          player.remainingBuffDuration -= 1000;
          if (player.remainingBuffDuration <= 0) {
            clearInterval(player.speedEffectTimer);
            player.speedEffectTimer = null;
            if (resource.type === 'slowdown') {
              player.buffEnding = true;
            } else if (resource.type === 'speedup') {
              player.speedMultiplier = 1;
            }
          }
        }
      };

      player.speedMultiplier = resource.speedMultiplier;
      player.speedEffectTimer = setInterval(updateBuffDuration, 1000);
      break;

    case 'teleport':
      player.score += resource.score;
      const newPosition = calculateTeleportPosition();
      if (newPosition) {
        player.snake.predictedPosition.head = newPosition;
        player.score += resource.score;
      }
      break;
  }

  resources.removeResource(resource);
}

function addSnakeSegment(player) {
  const body = player.snake.predictedPosition.body;
  const lastSegment = body[body.length - 1];
  const secondLastSegment = body[body.length - 2];

  const newSegment = {
    x: lastSegment.x + (lastSegment.x - secondLastSegment.x),
    y: lastSegment.y + (lastSegment.y - secondLastSegment.y),
  };

  player.snake.predictedPosition.body.push(newSegment);
}

function calculateTeleportPosition() {
  const x =
    Math.floor(Math.random() * (BOARD_WIDTH / SEGMENT_SIZE)) * SEGMENT_SIZE;
  const y =
    Math.floor(Math.random() * (BOARD_HEIGHT / SEGMENT_SIZE)) * SEGMENT_SIZE;

  return { x, y };
}

export { applyResourceEffect };

import { SEGMENT_SIZE, BOARD_HEIGHT, BOARD_WIDTH } from '../../constants.js';
import { players } from '../models/players.js';

const RESOURCE_TYPES = {
  PLAIN: {
    type: 'plain',
    probability: 0.8,
    score: 1,
  },
  SLOWDOWN: {
    type: 'slowdown',
    probability: 0.08,
    duration: 5000,
    score: 2,
    speedMultiplier: 0.5,
  },
  SPEEDUP: {
    type: 'speedup',
    probability: 0.08,
    duration: 5000,
    score: 2,
    speedMultiplier: 1.5,
  },
  TELEPORT: {
    type: 'teleport',
    probability: 0.04,
    score: 10,
  },
};

class ResourceManager {
  constructor() {
    this.resources = [];
    this.resourceBatchTimer = 1;
  }

  getResources() {
    return this.resources;
  }

  getResourceBatchTimer() {
    return this.resourceBatchTimer;
  }

  updateResourceBatchTimer(time, reset) {
    if (reset) {
      this.resourceBatchTimer = time;
    } else {
      this.resourceBatchTimer = this.resourceBatchTimer + time;
    }
  }

  addResourceBatch(count) {
    const newResources = [];
    let attempts = 0;
    const maxAttempts = count * 2;

    while (newResources.length < count && attempts < maxAttempts) {
      const position = this.calculateResourcePosition(newResources);
      if (position) {
        const selectedType = this.selectResourceType();
        // Generate a random id for the resource
        const id = Math.floor(Math.random() * 1000000);
        newResources.push({
          ...position,
          ...selectedType,
          id,
        });
      }
      attempts++;
    }

    this.resources = [...this.resources, ...newResources];
  }

  calculateResourcePosition(newResources) {
    const x =
      Math.floor(
        Math.random() * ((BOARD_WIDTH + SEGMENT_SIZE) / SEGMENT_SIZE)
      ) * SEGMENT_SIZE;
    const y =
      Math.floor(
        Math.random() * ((BOARD_HEIGHT + SEGMENT_SIZE) / SEGMENT_SIZE)
      ) * SEGMENT_SIZE;

    const isExistingResourceCollision = this.resources.some(
      r => r.x === x && r.y === y
    );

    const isNewResourceCollision = newResources.some(
      r => r.x === x && r.y === y
    );

    const isSnakeCollision = players
      .getPlayers()
      .some(
        p =>
          (p.snake.predictedPosition.head.x === x &&
            p.snake.predictedPosition.head.y === y) ||
          p.snake.predictedPosition.body.some(
            segment => segment.x === x && segment.y === y
          )
      );

    if (
      isExistingResourceCollision ||
      isNewResourceCollision ||
      isSnakeCollision
    ) {
      return null;
    }

    return { x, y };
  }

  selectResourceType() {
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const resourceType of Object.values(RESOURCE_TYPES)) {
      cumulativeProbability += resourceType.probability;
      if (rand < cumulativeProbability) {
        return resourceType;
      }
    }
    return RESOURCE_TYPES.PLAIN;
  }

  removeResource(resource) {
    this.resources = this.resources.filter(
      r =>
        !(r.x === resource.x && r.y === resource.y && r.type === resource.type)
    );
  }

  resetResources() {
    this.resources = [];
    this.resourceBatchTimer = 1;
  }
}

export const resources = new ResourceManager();

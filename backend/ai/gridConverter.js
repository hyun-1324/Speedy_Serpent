import { resources } from '../models/resources.js';
import { players } from '../models/players.js';
import { SEGMENT_SIZE } from '../../constants.js';

function convertToGrid() {
  const gridResources = resources.getResources().map(resource => ({
    x: Math.floor(resource.x / SEGMENT_SIZE),
    y: Math.floor(resource.y / SEGMENT_SIZE),
    type: resource.type,
  }));

  const gridPlayers = players.getPlayersForGameState().map(player => {
    const gridHead = {
      x: Math.floor(player.snake.lastConfirmedPosition.head.x / SEGMENT_SIZE),
      y: Math.floor(player.snake.lastConfirmedPosition.head.y / SEGMENT_SIZE),
    };

    const gridBody = player.snake.lastConfirmedPosition.body.map(segment => ({
      x: Math.floor(segment.x / SEGMENT_SIZE),
      y: Math.floor(segment.y / SEGMENT_SIZE),
    }));

    return {
      name: player.name,
      head: gridHead,
      body: gridBody,
    };
  });

  return {
    resources: gridResources,
    players: gridPlayers,
  };
}

export { convertToGrid };

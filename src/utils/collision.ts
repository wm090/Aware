import { Position } from '../types';
import { PLAYER, ARROW } from '../constants';

// Calculate distance between two points
export const distance = (p1: Position, p2: Position): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Check if arrow collides with player
export const checkCollision = (playerPosition: Position, arrowPosition: Position): boolean => {
  const dist = distance(playerPosition, arrowPosition);
  return dist < (PLAYER.RADIUS + ARROW.SIZE / 2);
};

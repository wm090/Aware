import { Position } from '../types';
import { ARROW } from '../constants';

// Generate a random number between min and max
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate a random position along the edge of the screen
export const randomEdgePosition = (width: number, height: number): Position => {
  // Only use left and right edges to ensure arrows only come from the sides
  const edge = Math.floor(Math.random() * 2); // 0: left, 1: right

  switch (edge) {
    case 0: // left
      return { x: 0, y: randomBetween(0, height) };
    case 1: // right
      return { x: width, y: randomBetween(0, height) };
    default:
      return { x: 0, y: 0 };
  }
};

// Generate a random arrow speed
export const randomArrowSpeed = (): number => {
  return randomBetween(ARROW.MIN_SPEED, ARROW.MAX_SPEED);
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

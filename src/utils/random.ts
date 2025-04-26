import { Position } from '../types';
import { ARROW } from '../constants';

// Generate a random number between min and max
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate a random position outside the visible screen area
export const randomEdgePosition = (width: number, height: number): Position => {
  // Define a larger offset to ensure arrows spawn outside the visible area on all devices
  const offset = 100; // 100 pixels outside the screen

  // Ensure we're not spawning arrows too close to the corners
  const padding = 50; // Avoid spawning within 50px of corners

  const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

  switch (edge) {
    case 0: // top (above the screen)
      return {
        x: randomBetween(padding, width - padding),
        y: -offset
      };
    case 1: // right (to the right of the screen)
      return {
        x: width + offset,
        y: randomBetween(padding, height - padding)
      };
    case 2: // bottom (below the screen)
      return {
        x: randomBetween(padding, width - padding),
        y: height + offset
      };
    case 3: // left (to the left of the screen)
      return {
        x: -offset,
        y: randomBetween(padding, height - padding)
      };
    default:
      return { x: -offset, y: -offset }; // Fallback position outside the screen
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

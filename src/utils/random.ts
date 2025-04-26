import { Position } from '../types';
import { ARROW } from '../constants';

// Generate a random number between min and max
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate a random position ONLY from the edges of the screen
export const randomEdgePosition = (width: number, height: number): Position => {
  // Define a larger offset to ensure arrows spawn outside the visible area on all devices
  const offset = 150; // 150 pixels outside the screen

  // Only spawn from the 4 edges, never from the middle
  // 0: top, 1: right, 2: bottom, 3: left
  const edge = Math.floor(Math.random() * 4);

  // Calculate the position based on the selected edge
  let position: Position;

  switch (edge) {
    case 0: // TOP edge only
      position = {
        // X position is random along the top edge, but avoid the middle 50% of the screen
        x: Math.random() < 0.5
          ? randomBetween(0, width * 0.25) // Left quarter of the screen
          : randomBetween(width * 0.75, width), // Right quarter of the screen
        y: -offset // Above the screen
      };
      break;

    case 1: // RIGHT edge only
      position = {
        x: width + offset, // Right of the screen
        // Y position is random along the right edge, but avoid the middle 50% of the screen
        y: Math.random() < 0.5
          ? randomBetween(0, height * 0.25) // Top quarter of the screen
          : randomBetween(height * 0.75, height) // Bottom quarter of the screen
      };
      break;

    case 2: // BOTTOM edge only
      position = {
        // X position is random along the bottom edge, but avoid the middle 50% of the screen
        x: Math.random() < 0.5
          ? randomBetween(0, width * 0.25) // Left quarter of the screen
          : randomBetween(width * 0.75, width), // Right quarter of the screen
        y: height + offset // Below the screen
      };
      break;

    case 3: // LEFT edge only
      position = {
        x: -offset, // Left of the screen
        // Y position is random along the left edge, but avoid the middle 50% of the screen
        y: Math.random() < 0.5
          ? randomBetween(0, height * 0.25) // Top quarter of the screen
          : randomBetween(height * 0.75, height) // Bottom quarter of the screen
      };
      break;

    default:
      // Fallback to a safe position (top-left corner)
      position = { x: -offset, y: -offset };
  }

  return position;
};

// Generate a random arrow speed
export const randomArrowSpeed = (): number => {
  return randomBetween(ARROW.MIN_SPEED, ARROW.MAX_SPEED);
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

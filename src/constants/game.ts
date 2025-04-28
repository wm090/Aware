// Game constants
export const PLAYER = {
  RADIUS: 20,
  COLOR: 'black',
  INITIAL_POSITION: { x: 0, y: 0 }, // Initial offset - actual centering is done in GameContext
};

export const ARROW = {
  SIZE: 15,
  MIN_SPEED: 5,  // Increased from 2
  MAX_SPEED: 5, // Increased from 5
  SPAWN_INTERVAL: 450, // ms
  MAX_COUNT: 20, // Maximum number of arrows on screen
};

export const GAME = {
  BACKGROUND_COLOR: 'white',
};

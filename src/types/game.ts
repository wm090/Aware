// Game types

export type Position = {
  x: number;
  y: number;
};

export type Arrow = {
  id: string;
  position: Position;
  angle: number;
  speed: number;
  target: Position;
};

export type GameState = 'idle' | 'playing' | 'gameOver';

export type PlayerState = {
  position: Position;
};

export type GameContextType = {
  gameState: GameState;
  playerState: PlayerState;
  arrows: Arrow[];
  elapsedTime: number;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  updatePlayerPosition: (position: Position) => void;
};

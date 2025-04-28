import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import { GameContextType, GameState, Position, Arrow } from '../types';
import { randomEdgePosition, randomArrowSpeed, generateId, checkCollision } from '../utils';
import { ARROW, PLAYER } from '../constants';
import { getUsername, saveScore } from '../utils/storage';

// Default values
const defaultGameContext: GameContextType = {
  gameState: 'idle',
  playerState: {
    position: { x: 0, y: 0 },
  },
  arrows: [],
  elapsedTime: 0,
  startGame: () => {},
  endGame: () => {},
  resetGame: () => {},
  updatePlayerPosition: () => {},
};

// Create context
const GameContext = createContext<GameContextType>(defaultGameContext);

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  // Initialize player position at (0,0) - it will be centered in the PlayerCircle component
  const [playerState, setPlayerState] = useState({
    position: {
      x: 0,
      y: 0,
    },
  });
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Use refs for values that shouldn't trigger re-renders
  const lastSpawnTimeRef = useRef(0);
  const gameLoopIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initialize player position ref at (0,0)
  const playerPositionRef = useRef({
    x: 0,
    y: 0,
  });

  // Update player position
  const updatePlayerPosition = useCallback((position: Position) => {
    playerPositionRef.current = position;
    setPlayerState(prev => ({
      ...prev,
      position,
    }));
  }, []);

  // Start the game
  const startGame = useCallback(() => {
    // Reset game state
    setElapsedTime(0);
    lastSpawnTimeRef.current = 0;
    lastTimeRef.current = null;
    startTimeRef.current = null;
    setArrows([]);

    // Reset player position to (0,0)
    const initialPosition = { x: 0, y: 0 };
    playerPositionRef.current = initialPosition;
    setPlayerState({ position: initialPosition });

    // Set game state to playing
    setGameState('playing');
  }, []);

  // End the game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (gameLoopIdRef.current) {
      cancelAnimationFrame(gameLoopIdRef.current);
      gameLoopIdRef.current = null;
      lastTimeRef.current = null;
    }

    // Save score to leaderboard
    const saveGameScore = async () => {
      try {
        const username = await getUsername();
        if (username) {
          await saveScore(username, elapsedTime);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    };

    saveGameScore();
  }, [elapsedTime]);

  // Reset the game
  const resetGame = useCallback(() => {
    // Reset game state
    setElapsedTime(0);
    setArrows([]);
    lastTimeRef.current = null;
    startTimeRef.current = null;

    // Reset player position to (0,0)
    const initialPosition = { x: 0, y: 0 };
    playerPositionRef.current = initialPosition;
    setPlayerState({ position: initialPosition });

    // Set game state to idle
    setGameState('idle');
  }, []);

  // Reset player position when component mounts
  useEffect(() => {
    const initialPosition = { x: 0, y: 0 };
    playerPositionRef.current = initialPosition;
    setPlayerState({ position: initialPosition });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      // Game loop function using requestAnimationFrame for more accurate timing
      const gameLoop = (timestamp: number) => {
        // Initialize start time on first frame
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
          lastTimeRef.current = timestamp;
        }

        // Calculate elapsed time based on actual timestamps
        const deltaTime = timestamp - (lastTimeRef.current || timestamp);
        lastTimeRef.current = timestamp;

        // Update elapsed time based on actual time passed
        setElapsedTime(prev => prev + deltaTime);

        // Spawn arrows
        const currentTime = Date.now();
        if (currentTime - lastSpawnTimeRef.current > ARROW.SPAWN_INTERVAL) {
          lastSpawnTimeRef.current = currentTime;

          setArrows(prevArrows => {
            if (prevArrows.length < ARROW.MAX_COUNT) {
              const { width, height } = Dimensions.get('window');
              const spawnPosition = randomEdgePosition(width, height);

              // Target the player's current position when the arrow spawns
              // This ensures arrows aim at the player, but won't follow them after spawning

              // Get the player's current position
              const playerPos = playerPositionRef.current;

              // Use the player's exact position as the target
              const targetX = playerPos.x;
              const targetY = playerPos.y;

              // Calculate direction vector from spawn to target
              const dirX = targetX - spawnPosition.x;
              const dirY = targetY - spawnPosition.y;

              // Normalize the direction vector
              const length = Math.sqrt(dirX * dirX + dirY * dirY);
              const normDirX = dirX / length;
              const normDirY = dirY / length;

              // Calculate a target point that's far beyond the center
              // This ensures arrows will continue in their trajectory across the screen
              const farTargetX = targetX + normDirX * (width + height) * 2; // Use 2x screen diagonal as distance
              const farTargetY = targetY + normDirY * (width + height) * 2;

              const newArrow: Arrow = {
                id: generateId(),
                position: spawnPosition,
                angle: 0, // Will be calculated in the component
                speed: randomArrowSpeed(),
                target: { x: farTargetX, y: farTargetY }, // Target point far beyond the center
              };

              return [...prevArrows, newArrow];
            }
            return prevArrows;
          });
        }

        // Move arrows and check for collisions
        setArrows(prevArrows => {
          // Move arrows
          const movedArrows = prevArrows.map(arrow => {
            // Move arrow towards its target
            // Calculate angle from arrow to target
            const angle = Math.atan2(arrow.target.y - arrow.position.y, arrow.target.x - arrow.position.x);

            // Move arrow in that direction
            const newPosition = {
              x: arrow.position.x + Math.cos(angle) * arrow.speed,
              y: arrow.position.y + Math.sin(angle) * arrow.speed,
            };

            return {
              ...arrow,
              position: newPosition,
            };
          });

          // Check for collisions
          const collision = movedArrows.some(arrow =>
            checkCollision(playerPositionRef.current, arrow.position)
          );

          if (collision) {
            // End the game on next tick to avoid state updates during render
            setTimeout(() => endGame(), 0);
          }

          // Only remove arrows that are far off-screen (increased buffer zone)
          const { width, height } = Dimensions.get('window');
          const bufferZone = 300; // Increased to 300 to ensure arrows don't disappear prematurely on any device

          return movedArrows.filter(arrow =>
            arrow.position.x >= -bufferZone &&
            arrow.position.x <= width + bufferZone &&
            arrow.position.y >= -bufferZone &&
            arrow.position.y <= height + bufferZone
          );
        });

        // Continue the animation loop
        gameLoopIdRef.current = requestAnimationFrame(gameLoop);
      };

      // Start the game loop with requestAnimationFrame
      gameLoopIdRef.current = requestAnimationFrame(gameLoop);

      // Cleanup function
      return () => {
        if (gameLoopIdRef.current) {
          cancelAnimationFrame(gameLoopIdRef.current);
          gameLoopIdRef.current = null;
        }
      };
    }
  }, [gameState, endGame]);

  const value = {
    gameState,
    playerState,
    arrows,
    elapsedTime,
    startGame,
    endGame,
    resetGame,
    updatePlayerPosition,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

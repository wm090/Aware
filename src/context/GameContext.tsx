import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import { GameContextType, GameState, Position, Arrow } from '../types';
import { randomEdgePosition, randomArrowSpeed, generateId, checkCollision } from '../utils';
import { ARROW } from '../constants';

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
  const [playerState, setPlayerState] = useState({
    position: {
      x: Dimensions.get('window').width / 2,
      y: Dimensions.get('window').height / 2,
    },
  });
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Use refs for values that shouldn't trigger re-renders
  const lastSpawnTimeRef = useRef(0);
  const gameLoopIdRef = useRef<NodeJS.Timeout | null>(null);
  const playerPositionRef = useRef(playerState.position);

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
    setGameState('playing');
    setElapsedTime(0);
    lastSpawnTimeRef.current = 0;
    setArrows([]);

    // Center the player
    const centerPosition = {
      x: Dimensions.get('window').width / 2,
      y: Dimensions.get('window').height / 2,
    };
    playerPositionRef.current = centerPosition;
    setPlayerState({ position: centerPosition });
  }, []);

  // End the game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (gameLoopIdRef.current) {
      clearInterval(gameLoopIdRef.current);
      gameLoopIdRef.current = null;
    }
  }, []);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState('idle');
    setElapsedTime(0);
    setArrows([]);

    // Center the player
    const centerPosition = {
      x: Dimensions.get('window').width / 2,
      y: Dimensions.get('window').height / 2,
    };
    playerPositionRef.current = centerPosition;
    setPlayerState({ position: centerPosition });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      // Game loop function
      const gameLoop = () => {
        // Update elapsed time
        setElapsedTime(prev => prev + 16); // ~60 FPS

        // Spawn arrows
        const currentTime = Date.now();
        if (currentTime - lastSpawnTimeRef.current > ARROW.SPAWN_INTERVAL) {
          lastSpawnTimeRef.current = currentTime;

          setArrows(prevArrows => {
            if (prevArrows.length < ARROW.MAX_COUNT) {
              const { width, height } = Dimensions.get('window');
              const spawnPosition = randomEdgePosition(width, height);

              // Calculate a target point that's beyond the player position
              // This ensures arrows continue past the player instead of stopping
              const playerPos = playerPositionRef.current;

              // Calculate direction vector from spawn to player
              const dirX = playerPos.x - spawnPosition.x;
              const dirY = playerPos.y - spawnPosition.y;

              // Normalize the direction vector
              const length = Math.sqrt(dirX * dirX + dirY * dirY);
              const normDirX = dirX / length;
              const normDirY = dirY / length;

              // Calculate a target point that's far beyond the player
              // This ensures arrows will continue in their trajectory
              const targetX = playerPos.x + normDirX * (width + height); // Use screen diagonal as distance
              const targetY = playerPos.y + normDirY * (width + height);

              const newArrow: Arrow = {
                id: generateId(),
                position: spawnPosition,
                angle: 0, // Will be calculated in the component
                speed: randomArrowSpeed(),
                target: { x: targetX, y: targetY }, // Target point beyond the player
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
      };

      // Start the game loop
      gameLoopIdRef.current = setInterval(gameLoop, 16); // ~60 FPS

      // Cleanup function
      return () => {
        if (gameLoopIdRef.current) {
          clearInterval(gameLoopIdRef.current);
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

import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, PanResponder, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { GameProvider, useGameContext } from '../src/context/GameContext';
import PlayerCircle from '../src/components/game/PlayerCircle';
import Arrow from '../src/components/game/Arrow';
import TimerDisplay from '../src/components/game/TimerDisplay';
import GameOverOverlay from '../src/components/game/GameOverOverlay';
import { GAME } from '../src/constants';

// Game screen content
const GameContent: React.FC = () => {
  const { gameState, arrows, startGame, updatePlayerPosition, playerState } = useGameContext();
  const [touchActive, setTouchActive] = useState(false);
  const lastPositionRef = useRef(playerState.position);

  // Don't allow movement if game is over
  const isDisabled = gameState === 'gameOver' || gameState === 'idle';

  // Update the reference when playerState changes
  useEffect(() => {
    lastPositionRef.current = playerState.position;
  }, [playerState.position]);

  // Create pan responder for the entire screen
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isDisabled,
    onMoveShouldSetPanResponder: () => !isDisabled,
    onPanResponderGrant: () => {
      setTouchActive(true);
      // Use the current player position from context
      lastPositionRef.current = playerState.position;
    },
    onPanResponderMove: (_, gestureState) => {
      if (isDisabled) return;

      // Calculate new position based on the gesture movement
      const newPosition = {
        x: lastPositionRef.current.x + gestureState.dx,
        y: lastPositionRef.current.y + gestureState.dy,
      };

      // Update position in context
      updatePlayerPosition(newPosition);
    },
    onPanResponderRelease: () => {
      setTouchActive(false);
      // Store the final position
      lastPositionRef.current = playerState.position;
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Timer display */}
      <TimerDisplay />

      {/* Start button (only shown in idle state) */}
      {gameState === 'idle' && (
        <View style={styles.startContainer}>
          <Text style={styles.title}>Aware</Text>
          <Text style={styles.subtitle}>Focus & Awareness Game</Text>
          <Button
            mode="contained"
            onPress={startGame}
            style={styles.startButton}
            labelStyle={styles.buttonLabel}
          >
            Start Game
          </Button>
        </View>
      )}

      {/* Player circle */}
      <PlayerCircle />

      {/* Arrows */}
      {arrows.map(arrow => (
        <Arrow key={arrow.id} arrow={arrow} />
      ))}

      {/* Game over overlay */}
      <GameOverOverlay />

      {/* Touch overlay for controlling player from anywhere */}
      {gameState === 'playing' && (
        <View
          style={styles.touchOverlay}
          {...panResponder.panHandlers}
        />
      )}
    </View>
  );
};

// Main game screen with provider
export default function GameScreen() {
  return (
    <View style={styles.root}>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: GAME.BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  startButton: {
    width: 200,
    marginTop: 20,
  },
  buttonLabel: {
    fontSize: 18,
    padding: 5,
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1, // Above background but below arrows, player, and game over overlay
  },
});

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
  const { gameState, arrows, startGame } = useGameContext();

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
});

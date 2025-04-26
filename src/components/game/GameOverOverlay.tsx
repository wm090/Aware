import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { formatTime } from '../../utils';
import { useGameContext } from '../../context/GameContext';

const GameOverOverlay: React.FC = () => {
  const { gameState, elapsedTime, resetGame } = useGameContext();
  
  // Only show when game is over
  if (gameState !== 'gameOver') {
    return null;
  }
  
  // Format the final time
  const formattedTime = formatTime(elapsedTime);
  
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.subtitle}>Your time:</Text>
        <Text style={styles.time}>{formattedTime}</Text>
        <Button 
          mode="contained" 
          onPress={resetGame}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Play Again
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'red',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
  buttonLabel: {
    fontSize: 16,
    padding: 5,
  },
});

export default GameOverOverlay;

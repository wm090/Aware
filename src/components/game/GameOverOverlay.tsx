import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatTime } from '../../utils/animation';
import { useGameContext } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import CustomButton from '../ui/CustomButton';

const GameOverOverlay: React.FC = () => {
  const { gameState, elapsedTime, resetGame } = useGameContext();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  // Only show when game is over
  if (gameState !== 'gameOver') {
    return null;
  }

  // Format the final time
  const formattedTime = formatTime(elapsedTime);

  const viewLeaderboard = () => {
    router.push('/leaderboard');
  };

  return (
    <View style={[
      styles.overlay,
      { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)' }
    ]}>
      <View style={[
        styles.container,
        { backgroundColor: theme.colors.background }
      ]}>
        <Text style={[styles.title, { color: 'red' }]}>Game Over</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>Your time:</Text>
        <Text style={[styles.time, { color: theme.colors.text }]}>{formattedTime}</Text>
        <CustomButton
          mode="contained"
          onPress={resetGame}
          style={styles.button}
          title="Play Again"
        />
        <CustomButton
          mode="outlined"
          onPress={viewLeaderboard}
          style={styles.button}
          title="View Leaderboard"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
});

export default GameOverOverlay;

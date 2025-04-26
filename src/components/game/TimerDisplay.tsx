import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../../utils';
import { useGameContext } from '../../context/GameContext';

const TimerDisplay: React.FC = () => {
  const { elapsedTime, gameState } = useGameContext();
  
  // Format the elapsed time
  const formattedTime = formatTime(elapsedTime);
  
  return (
    <View style={styles.container}>
      <Text style={[
        styles.timer,
        gameState === 'gameOver' && styles.gameOverTimer
      ]}>
        {formattedTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 5,
    zIndex: 20,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  gameOverTimer: {
    color: 'red',
  },
});

export default React.memo(TimerDisplay);

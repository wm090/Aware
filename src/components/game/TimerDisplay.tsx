import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../../utils/animation';
import { useGameContext } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

const TimerDisplay: React.FC = () => {
  const { elapsedTime, gameState } = useGameContext();
  const { theme, isDarkMode } = useTheme();

  // Format the elapsed time
  const formattedTime = formatTime(elapsedTime);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode
          ? 'rgba(30, 30, 30, 0.7)'
          : 'rgba(255, 255, 255, 0.7)'
      }
    ]}>
      <Text style={[
        styles.timer,
        { color: gameState !== 'gameOver' ? theme.colors.text : 'red' }
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
    borderRadius: 8,
    zIndex: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default React.memo(TimerDisplay);

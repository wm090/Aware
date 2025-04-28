import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PLAYER } from '../../constants';
import { useGameContext } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

const PlayerCircle: React.FC = () => {
  const { playerState, gameState } = useGameContext();
  const { isDarkMode } = useTheme();
  const { position } = playerState;

  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate base position (center of screen)
  let baseY = screenHeight / 2;

  // If we're in the idle state (showing the start screen), position the player below the Start Game button
  if (gameState === 'idle') {
    // Position the player circle below the "Start Game" button
    baseY = screenHeight * 0.75; // 75% down the screen - further down for better visibility
  }

  // Calculate absolute position (base position + offset from player movement)
  const absoluteX = screenWidth / 2 - PLAYER.RADIUS + position.x;
  const absoluteY = baseY - PLAYER.RADIUS + position.y;

  return (
    <View
      style={[
        styles.player,
        {
          left: absoluteX,
          top: absoluteY,
        },
      ]}
    >
      <View
        style={[
          styles.circle,
          { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: PLAYER.RADIUS * 2,
    height: PLAYER.RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15, // Increased z-index to ensure visibility
  },
  circle: {
    width: PLAYER.RADIUS * 2,
    height: PLAYER.RADIUS * 2,
    borderRadius: PLAYER.RADIUS,
    backgroundColor: PLAYER.COLOR,
  },
});

export default PlayerCircle;

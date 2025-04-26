import React, { useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { PLAYER } from '../../constants';
import { useGameContext } from '../../context/GameContext';

const PlayerCircle: React.FC = () => {
  const { gameState, updatePlayerPosition } = useGameContext();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Don't allow movement if game is over
  const isDisabled = gameState === 'gameOver';

  // Create pan responder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isDisabled,
    onMoveShouldSetPanResponder: () => !isDisabled,
    onPanResponderGrant: () => {
      // Store initial position
    },
    onPanResponderMove: (_, gestureState) => {
      const newPosition = {
        x: position.x + gestureState.dx,
        y: position.y + gestureState.dy,
      };

      // Update local state
      setPosition(newPosition);

      // Update position in context
      updatePlayerPosition(newPosition);
    },
    onPanResponderRelease: (_, gestureState) => {
      // Update final position
      const newPosition = {
        x: position.x + gestureState.dx,
        y: position.y + gestureState.dy,
      };

      setPosition(newPosition);
      updatePlayerPosition(newPosition);
    },
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.player,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
          ],
        },
      ]}
    >
      <View style={styles.circle} />
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
    zIndex: 10,
  },
  circle: {
    width: PLAYER.RADIUS * 2,
    height: PLAYER.RADIUS * 2,
    borderRadius: PLAYER.RADIUS,
    backgroundColor: PLAYER.COLOR,
  },
});

export default PlayerCircle;

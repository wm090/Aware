import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PLAYER } from '../../constants';
import { useGameContext } from '../../context/GameContext';

const PlayerCircle: React.FC = () => {
  const { playerState } = useGameContext();
  const { position } = playerState;

  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate absolute position (center of screen + offset from player movement)
  const absoluteX = screenWidth / 2 - PLAYER.RADIUS + position.x;
  const absoluteY = screenHeight / 2 - PLAYER.RADIUS + position.y;

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

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PLAYER } from '../../constants';
import { useGameContext } from '../../context/GameContext';

const PlayerCircle: React.FC = () => {
  const { playerState } = useGameContext();
  const { position } = playerState;

  return (
    <View
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

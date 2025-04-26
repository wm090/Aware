import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Arrow as ArrowType } from '../../types';
import { ARROW } from '../../constants';
import { COLORS } from '../../constants/colors';
import { calculateAngle } from '../../utils';

interface ArrowProps {
  arrow: ArrowType;
}

const Arrow: React.FC<ArrowProps> = ({ arrow }) => {
  // Calculate angle for arrow to point towards target
  const angle = calculateAngle(arrow.position, arrow.target);
  const rotation = `${angle}rad`;

  return (
    <View
      style={[
        styles.arrow,
        {
          transform: [
            { translateX: arrow.position.x },
            { translateY: arrow.position.y },
            { rotate: rotation },
          ],
        },
      ]}
    >
      {/* Triangle shape for the arrow */}
      <View style={styles.triangle} />
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    position: 'absolute',
    width: ARROW.SIZE,
    height: ARROW.SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: ARROW.SIZE / 2,
    borderRightWidth: ARROW.SIZE / 2,
    borderBottomWidth: ARROW.SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.ARROW,
    transform: [{ rotate: '90deg' }],
  },
});

export default React.memo(Arrow);

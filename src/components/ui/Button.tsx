import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

interface ButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  color?: string;
  disabled?: boolean;
  style?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  mode = 'contained',
  color,
  disabled = false,
  style,
}) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
      labelStyle={styles.label}
      color={color}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;

import React from 'react';
import { StyleSheet, View, Animated, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { IconButton } from 'react-native-paper';

interface ThemeToggleProps {
  style?: any;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <IconButton
        icon={isDarkMode ? 'weather-night' : 'weather-sunny'}
        iconColor={isDarkMode ? '#FFFFFF' : '#000000'}
        size={24}
        onPress={toggleTheme}
        style={[
          styles.toggle,
          isDarkMode ? styles.darkToggle : styles.lightToggle
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: {
    borderRadius: 20,
  },
  lightToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  darkToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default ThemeToggle;

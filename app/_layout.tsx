import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

// Define font configuration
const fontConfig = {
  fontFamily: 'System',
  // Define all the required variants
  variants: {
    regular: {
      fontWeight: 'normal',
    },
    medium: {
      fontWeight: '500',
    },
    bold: {
      fontWeight: 'bold',
    },
    heavy: {
      fontWeight: '900',
    },
    // Add the missing labelLarge variant
    labelLarge: {
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
  },
};

// Layout with theme applied
function ThemedLayout() {
  const { theme } = useTheme();

  // Create a custom theme with the font configuration
  const customTheme = {
    ...theme,
    fonts: configureFonts({ config: fontConfig }),
  };

  return (
    <PaperProvider theme={customTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      />
    </PaperProvider>
  );
}

// Root layout with theme provider
export default function Layout() {
  return (
    <ThemeProvider>
      <ThemedLayout />
    </ThemeProvider>
  );
}

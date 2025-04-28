import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, configureFonts } from 'react-native-paper';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import AuthGuard from '../src/components/auth/AuthGuard';

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
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="game" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="auth" />
      </Stack>
    </PaperProvider>
  );
}

// Root layout with providers
export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthGuard>
          <ThemedLayout />
        </AuthGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}

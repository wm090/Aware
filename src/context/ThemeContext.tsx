import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme, configureFonts } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

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

// Storage key for theme preference
const THEME_STORAGE_KEY = 'aware_theme_preference';

// Theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Create combined themes for React Navigation and React Native Paper
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
});

// Custom light theme
const CustomLightTheme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    primary: '#6750A4', // Purple color matching the start button
    background: '#FFFFFF',
    text: '#000000',
    card: '#F5F5F5',
    border: '#E0E0E0',
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Custom dark theme
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#9F85E0', // Lighter purple for dark mode
    background: '#121212',
    text: '#FFFFFF',
    card: '#1E1E1E',
    border: '#333333',
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Theme context type
interface ThemeContextType {
  theme: typeof CustomLightTheme | typeof CustomDarkTheme;
  themeType: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeType: (type: ThemeType) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: CustomLightTheme,
  themeType: 'system',
  isDarkMode: false,
  toggleTheme: () => {},
  setThemeType: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // State for theme preference
  const [themeType, setThemeType] = useState<ThemeType>('system');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeType);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };

    saveThemePreference();
  }, [themeType]);

  // Determine if dark mode is active
  const isDarkMode =
    themeType === 'dark' ||
    (themeType === 'system' && systemColorScheme === 'dark');

  // Get the current theme object
  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setThemeType(prevTheme => {
      if (prevTheme === 'system') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      } else {
        return prevTheme === 'dark' ? 'light' : 'dark';
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, isDarkMode, toggleTheme, setThemeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

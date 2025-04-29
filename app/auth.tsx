import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import CustomButton from '../src/components/ui/CustomButton';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { user, signIn, signUp } = useAuth();
  const { theme, isDarkMode } = useTheme();

  // If user is already authenticated, redirect to home
  if (user) {
    return <Redirect href="/" />;
  }

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signIn(email, password);
        // No need to navigate - the user state change will trigger the redirect
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        
        try {
          await signUp(email, password, username);
          // After sign up, user might need to verify email depending on your settings
          Alert.alert('Success', 'Account created! Please check your email for verification.');
          setIsLogin(true);
        } catch (error: any) {
          // Check if this is the RLS policy error we're expecting
          if (error.message?.includes('violates row-level security policy') ||
              (error.code === '42501' && error.message?.includes('profiles'))) {
            // Profile will be created on first login, so we can still show success
            Alert.alert('Success', 'Account created! Please check your email for verification.');
            setIsLogin(true);
          } else {
            // For any other error, show it to the user
            throw error;
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate contrasting colors for better visibility in both modes
  const labelColor = isDarkMode ? '#BFACEF' : theme.colors.primary; // Light purple in dark mode
  const placeholderColor = isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)"; // Higher opacity in dark mode

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.replace('/')}
      >
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.primary}
          size={24}
        />
        <Text style={[styles.backText, { color: theme.colors.primary }]}>Back</Text>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Text>

          {!isLogin && (
            <TextInput
              label="Username"
              placeholder="Enter your username"
              placeholderTextColor={placeholderColor}
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              mode="outlined"
              outlineColor={isDarkMode ? "#9370DB" : undefined}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.text}
              theme={{ 
                colors: { 
                  background: theme.colors.background,
                  placeholder: placeholderColor,
                  text: theme.colors.text,
                  onSurfaceVariant: labelColor  // This controls the label color
                } 
              }}
            />
          )}

          <TextInput
            label="Email"
            placeholder="Enter your email address"
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            outlineColor={isDarkMode ? "#9370DB" : undefined}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ 
              colors: { 
                background: theme.colors.background,
                placeholder: placeholderColor,
                text: theme.colors.text,
                onSurfaceVariant: labelColor  // This controls the label color
              } 
            }}
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            outlineColor={isDarkMode ? "#9370DB" : undefined}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ 
              colors: { 
                background: theme.colors.background,
                placeholder: placeholderColor,
                text: theme.colors.text,
                onSurfaceVariant: labelColor  // This controls the label color
              } 
            }}
          />

          {error && (
            <Text style={[styles.errorText, { color: isDarkMode ? '#FF6B6B' : 'red' }]}>
              {error}
            </Text>
          )}

          <CustomButton
            mode="contained"
            onPress={handleAuth}
            style={styles.button}
            title={isLogin ? 'Sign In' : 'Sign Up'}
          />

          <CustomButton
            mode="outlined"
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
            title={isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 10,
  },
  switchButton: {
    marginTop: 20,
  },
  errorText: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    marginLeft: -8, // Adjust the spacing between icon and text
    fontSize: 16,
    fontWeight: '500',
  },
});

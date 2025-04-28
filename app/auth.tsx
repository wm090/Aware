import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Redirect } from 'expo-router';
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

  const { user, signIn, signUp } = useAuth();
  const { theme } = useTheme();

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
        await signUp(email, password, username);
        // After sign up, user might need to verify email depending on your settings
        alert('Account created! You can now sign in.');
        setIsLogin(true);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Text>

        {!isLogin && (
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error && (
          <Text style={styles.errorText}>{error}</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  },
  button: {
    marginTop: 10,
  },
  switchButton: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

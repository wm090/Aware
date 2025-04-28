import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { saveUsername } from '../../utils/storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import CustomButton from '../ui/CustomButton';

interface UsernameModalProps {
  visible: boolean;
  onComplete: () => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ visible, onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      // If user is authenticated, we don't need to save the username locally
      // as it's already in the Supabase profile
      if (!user) {
        await saveUsername(username.trim());
      }

      setUsername('');
      setError('');
      onComplete();
    } catch (err) {
      setError('Failed to save username. Please try again.');
    }
  };

  const goToAuth = () => {
    onComplete(); // Close the modal
    router.push('/auth'); // Navigate to auth screen
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: theme.colors.background }
        ]}>
          <Text style={[
            styles.title,
            { color: theme.colors.text }
          ]}>
            Welcome to Aware!
          </Text>
          <Text style={[
            styles.subtitle,
            { color: theme.colors.text }
          ]}>
            You can play as a guest or create an account for the leaderboard
          </Text>

          <TextInput
            label="Guest Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            error={!!error}
            theme={{ colors: { primary: theme.colors.primary } }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomButton
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            title="Continue as Guest"
          />

          <Text style={[styles.orText, { color: theme.colors.text }]}>
            - OR -
          </Text>

          <CustomButton
            mode="outlined"
            onPress={goToAuth}
            style={styles.button}
            title="Sign In / Create Account"
          />

          <Text style={[styles.noteText, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
            Create an account to save your scores and compete on the global leaderboard!
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  orText: {
    marginTop: 15,
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 12,
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UsernameModal;

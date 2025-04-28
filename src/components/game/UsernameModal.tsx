import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { saveUsername } from '../../utils/storage';
import { useTheme } from '../../context/ThemeContext';
import CustomButton from '../ui/CustomButton';

interface UsernameModalProps {
  visible: boolean;
  onComplete: () => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ visible, onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { theme, isDarkMode } = useTheme();

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      await saveUsername(username.trim());
      setUsername('');
      setError('');
      onComplete();
    } catch (err) {
      setError('Failed to save username. Please try again.');
    }
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
            Please enter a username to continue
          </Text>

          <TextInput
            label="Username"
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
            title="Continue"
          />
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
    width: '80%',
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
});

export default UsernameModal;

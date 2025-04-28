import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { saveUsername } from '../../utils/storage';

interface UsernameModalProps {
  visible: boolean;
  onComplete: () => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ visible, onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

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
        <View style={styles.modalContent}>
          <Text style={styles.title}>Welcome to Aware!</Text>
          <Text style={styles.subtitle}>Please enter a username to continue</Text>
          
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            error={!!error}
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
          >
            Continue
          </Button>
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
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
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

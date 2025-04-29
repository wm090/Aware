import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, PanResponder, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameProvider, useGameContext } from '../src/context/GameContext';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import PlayerCircle from '../src/components/game/PlayerCircle';
import Arrow from '../src/components/game/Arrow';
import TimerDisplay from '../src/components/game/TimerDisplay';
import GameOverOverlay from '../src/components/game/GameOverOverlay';
import UsernameModal from '../src/components/game/UsernameModal';
import ThemeToggle from '../src/components/ui/ThemeToggle';
import CustomButton from '../src/components/ui/CustomButton';
import { GAME } from '../src/constants';
import { hasUsername } from '../src/utils/storage';

// Game screen content
const GameContent: React.FC = () => {
  const { gameState, arrows, startGame, updatePlayerPosition, playerState } = useGameContext();
  const { theme, isDarkMode } = useTheme();
  const { user, deleteAccount } = useAuth();
  const lastPositionRef = useRef(playerState.position);
  const router = useRouter();
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Don't allow movement if game is over
  const isDisabled = gameState === 'gameOver' || gameState === 'idle';

  // Check if username exists when component mounts
  useEffect(() => {
    const checkUsername = async () => {
      // If user is authenticated, we don't need to show the username modal
      if (user) {
        return;
      }

      // Otherwise, check if there's a local username
      const hasUser = await hasUsername();
      if (!hasUser) {
        setShowUsernameModal(true);
      }
    };

    checkUsername();
  }, [user]);

  // Update the reference when playerState changes
  useEffect(() => {
    lastPositionRef.current = playerState.position;
  }, [playerState.position]);

  // Reset the last position reference when game state changes
  useEffect(() => {
    // This ensures we start from the initial position when the game starts or resets
    if (gameState === 'playing' || gameState === 'idle') {
      // Reset to (0,0) to ensure proper positioning
      lastPositionRef.current = { x: 0, y: 0 };
      // Update the player position in the context
      if (playerState.position.x !== 0 || playerState.position.y !== 0) {
        updatePlayerPosition({ x: 0, y: 0 });
      }
    }
  }, [gameState, updatePlayerPosition]);

  // Create pan responder for the entire screen
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isDisabled,
    onMoveShouldSetPanResponder: () => !isDisabled,
    onPanResponderGrant: () => {
      // Use the current player position from context
      // This ensures we're always starting from the current position
      lastPositionRef.current = playerState.position;
    },
    onPanResponderMove: (_, gestureState) => {
      if (isDisabled) return;

      // Calculate new position based on the gesture movement
      const newPosition = {
        x: lastPositionRef.current.x + gestureState.dx,
        y: lastPositionRef.current.y + gestureState.dy,
      };

      // Update position in context
      updatePlayerPosition(newPosition);
    },
    onPanResponderRelease: () => {
      // Store the final position
      lastPositionRef.current = playerState.position;
    },
  });

  const handleUsernameComplete = () => {
    setShowUsernameModal(false);
  };

  const goToLeaderboard = () => {
    router.push('/leaderboard');
  };
  
  // Handle account deletion with confirmation
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert("Success", "Your account has been successfully deleted.");
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "Failed to delete your account. Please try again later.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.background }
    ]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Username modal */}
      <UsernameModal visible={showUsernameModal} onComplete={handleUsernameComplete} />

      {/* Timer display */}
      <TimerDisplay />

      {/* Theme toggle button (always visible) */}
      <ThemeToggle style={styles.themeToggle} />

      {/* Start button (only shown in idle state) */}
      {gameState === 'idle' && (
        <View style={styles.startContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Be Aware!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>Focus & Awareness Game</Text>
          <CustomButton
            mode="contained"
            onPress={startGame}
            style={styles.startButton}
            title="Start Game"
          />

          {/* Leaderboard button */}
          <CustomButton
            mode="outlined"
            onPress={goToLeaderboard}
            style={styles.leaderboardButton}
            title="Leaderboard"
            icon="trophy"
          />

          {/* Sign in button (only shown if not authenticated) */}
          {!user && (
            <CustomButton
              mode="outlined"
              onPress={() => router.push('/auth')}
              style={styles.authButton}
              title="Sign In / Create Account"
              icon="account"
            />
          )}

          {/* Account management options (only shown when user is authenticated) */}
          {user && (
            <>
              <CustomButton
                mode="outlined"
                onPress={() => router.push('/auth')}
                style={styles.accountButton}
                title="Manage Account"
                icon="account-cog"
              />
              
              <CustomButton
                mode="outlined"
                onPress={handleDeleteAccount}
                style={styles.deleteButton}
                title="Delete Account"
                icon="account-remove"
                textColor={isDarkMode ? "#FF6B6B" : "red"}
              />
            </>
          )}
        </View>
      )}

      {/* Player circle - only show in playing state or below the start button in idle state */}
      <PlayerCircle />

      {/* Arrows */}
      {arrows.map(arrow => (
        <Arrow key={arrow.id} arrow={arrow} />
      ))}

      {/* Game over overlay */}
      <GameOverOverlay />

      {/* Touch overlay for controlling player from anywhere */}
      {gameState === 'playing' && (
        <View
          style={styles.touchOverlay}
          {...panResponder.panHandlers}
        />
      )}
    </View>
  );
};

// Main game screen with provider
export default function GameScreen() {
  return (
    <View style={styles.root}>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: GAME.BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  startButton: {
    width: 200,
    marginTop: 20,
    marginBottom: 10, // Reduced to make space for leaderboard button
  },
  leaderboardButton: {
    width: 200,
    marginTop: 10,
    marginBottom: 10,
  },
  authButton: {
    width: 200,
    marginTop: 10,
    marginBottom: 30, // Add bottom margin to create space for the player circle
  },
  accountButton: {
    width: 200,
    marginTop: 10,
    marginBottom: 10,
  },
  deleteButton: {
    width: 200,
    marginTop: 10,
    marginBottom: 30,
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1, // Above background but below arrows, player, and game over overlay
  },
  themeToggle: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 10,
  },
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Divider, IconButton } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LeaderboardEntry } from '../src/utils/storage';
import { getUsername, clearUserScore, subscribeToLeaderboard } from '../src/utils/storageManager';
import { fetchLeaderboard } from '../src/utils/supabaseStorage';
import { formatTime } from '../src/utils/animation';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import CustomButton from '../src/components/ui/CustomButton';

const LeaderboardScreen: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();

  useEffect(() => {
    loadUsername();

    // Subscribe to real-time leaderboard updates
    const unsubscribe = subscribeToLeaderboard(setLeaderboard);

    // Force a refresh when the component mounts
    loadLeaderboard();

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const loadUsername = async () => {
    const username = await getUsername();
    setCurrentUsername(username);
  };

  const loadLeaderboard = async () => {
    console.log('Manually refreshing leaderboard...');
    setLoading(true);

    try {
      // Fetch the leaderboard data directly
      const leaderboardData = await fetchLeaderboard();
      setLeaderboard(leaderboardData);
      console.log('Leaderboard refreshed successfully:', leaderboardData);
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
      Alert.alert('Error', 'Failed to refresh leaderboard. Please try again.');
    } finally {
      // Delay setting loading to false for better UI feedback
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleClearUserScores = async () => {
    if (!user) return;

    Alert.alert(
      "Clear Your Scores",
      "Are you sure you want to remove all your scores from the leaderboard?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearUserScore();
            loadLeaderboard();
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert("Success", "You have been signed out");
      router.replace('/game');
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    // First, confirm the user wants to delete their account
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This will remove all your scores and profile data.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert(
                "Account Data Deleted",
                "Your scores and profile data have been removed. Your account has been signed out.",
                [{ text: "OK", onPress: () => router.replace('/game') }]
              );
            } catch (error) {
              Alert.alert("Error", "Failed to delete account data. Please try again.");
              console.error('Error in handleDeleteAccount:', error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    // Format the date
    const date = new Date(item.date);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

    // Get medal emoji for top 3
    let medal = '';
    if (index === 0) medal = '🥇';
    else if (index === 1) medal = '🥈';
    else if (index === 2) medal = '🥉';

    // Check if this is the current user's score
    const isCurrentUser = item.username === currentUsername;

    return (
      <View style={[
        styles.itemContainer,
        isCurrentUser && styles.currentUserItem,
        { backgroundColor: isCurrentUser ?
          (isDarkMode ? 'rgba(103, 80, 164, 0.15)' : 'rgba(103, 80, 164, 0.05)') :
          'transparent'
        }
      ]}>
        <View style={styles.rankContainer}>
          <Text style={[
            styles.rank,
            { color: theme.colors.text }
          ]}>
            {medal || `#${index + 1}`}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[
            styles.username,
            isCurrentUser && styles.currentUserText,
            { color: theme.colors.text }
          ]}>
            {item.username} {isCurrentUser && '(You)'}
          </Text>
          <Text style={[
            styles.date,
            { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }
          ]}>
            {formattedDate}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[
            styles.score,
            isCurrentUser && styles.currentUserScore,
            { color: theme.colors.primary }
          ]}>
            {formatTime(item.score)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.background }
    ]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View style={[
        styles.header,
        { backgroundColor: theme.colors.primary }
      ]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
          iconColor="white"
        />
        <Text style={styles.title}>Leaderboard</Text>

        <View style={styles.headerButtons}>
          <IconButton
            icon="refresh"
            size={24}
            onPress={loadLeaderboard}
            style={styles.headerButton}
            iconColor="white"
          />

          {/* Options button - using Alert instead of Menu */}
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={() => {
              // Show different options based on authentication status
              if (user) {
                // Show a menu with two main options
                Alert.alert(
                  "Options",
                  "Choose an option",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Manage Scores",
                      onPress: () => {
                        // Show score management options
                        Alert.alert(
                          "Manage Scores",
                          "Choose an option",
                          [
                            {
                              text: "Cancel",
                              style: "cancel"
                            },
                            {
                              text: "Clear My Scores",
                              onPress: handleClearUserScores,
                              style: "destructive"
                            }
                          ]
                        );
                      }
                    },
                    {
                      text: "Manage Account",
                      onPress: () => {
                        // Show account management options
                        Alert.alert(
                          "Manage Account",
                          "Choose an option",
                          [
                            {
                              text: "Cancel",
                              style: "cancel"
                            },
                            {
                              text: "Sign Out",
                              onPress: handleSignOut
                            },
                            {
                              text: "Delete Account",
                              onPress: handleDeleteAccount,
                              style: "destructive"
                            }
                          ]
                        );
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  "Sign In Required",
                  "Would you like to sign in or create an account?",
                  [
                    {
                      text: "Sign In / Create Account",
                      onPress: () => router.push('/auth')
                    },
                    {
                      text: "Cancel",
                      style: "cancel"
                    }
                  ]
                );
              }
            }}
            style={styles.headerButton}
            iconColor="white"
          />
        </View>
      </View>

      {leaderboard.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No scores yet. Play a game to be the first!
          </Text>
          <CustomButton
            mode="contained"
            onPress={() => router.push('/game')}
            style={styles.playButton}
            title="Play Now"
          />
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.username}-${item.date}-${index}`}
          ItemSeparatorComponent={() => <Divider style={{ backgroundColor: isDarkMode ? '#333' : '#eee' }} />}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadLeaderboard}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#6750A4', // Purple color matching the start button
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButton: {
    marginLeft: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  scoreContainer: {
    marginLeft: 8,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6750A4', // Purple color matching the start button
  },
  currentUserItem: {
    // Background color is now applied dynamically
  },
  currentUserText: {
    fontWeight: 'bold',
  },
  currentUserScore: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  playButton: {
    marginTop: 20,
  },
});

export default LeaderboardScreen;

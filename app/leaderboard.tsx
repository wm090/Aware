import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Divider, IconButton, Menu } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { getLeaderboard, LeaderboardEntry, getUsername, clearUserScore } from '../src/utils/storage';
import { formatTime } from '../src/utils/animation';

const LeaderboardScreen: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadLeaderboard();
    loadUsername();
  }, []);

  const loadUsername = async () => {
    const username = await getUsername();
    setCurrentUsername(username);
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard();
    setLeaderboard(data);
    setLoading(false);
  };

  const handleClearUserScores = async () => {
    if (!currentUsername) return;

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
            await clearUserScore(currentUsername);
            loadLeaderboard();
          }
        }
      ]
    );

    setMenuVisible(false);
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
        isCurrentUser && styles.currentUserItem
      ]}>
        <View style={styles.rankContainer}>
          <Text style={styles.rank}>{medal || `#${index + 1}`}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[
            styles.username,
            isCurrentUser && styles.currentUserText
          ]}>
            {item.username} {isCurrentUser && '(You)'}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[
            styles.score,
            isCurrentUser && styles.currentUserScore
          ]}>
            {formatTime(item.score)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={styles.title}>Leaderboard</Text>

        <View style={styles.headerButtons}>
          <IconButton
            icon="refresh"
            size={24}
            onPress={loadLeaderboard}
            style={styles.headerButton}
          />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => setMenuVisible(true)}
                style={styles.headerButton}
              />
            }
          >
            <Menu.Item
              onPress={handleClearUserScores}
              title="Clear My Scores"
              leadingIcon="delete"
            />
          </Menu>
        </View>
      </View>

      {leaderboard.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scores yet. Play a game to be the first!</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/game')}
            style={styles.playButton}
          >
            Play Now
          </Button>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.username}-${item.date}-${index}`}
          ItemSeparatorComponent={() => <Divider />}
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
    backgroundColor: 'rgba(103, 80, 164, 0.05)', // Light purple background
  },
  currentUserText: {
    fontWeight: 'bold',
  },
  currentUserScore: {
    color: '#6750A4', // Purple color matching the start button
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

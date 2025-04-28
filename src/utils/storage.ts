import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the leaderboard entry type
export interface LeaderboardEntry {
  username: string;
  score: number; // Time in milliseconds
  date: string;
}

// Storage keys
const STORAGE_KEYS = {
  USERNAME: 'aware_username',
  LEADERBOARD: 'aware_leaderboard',
};

// Save username
export const saveUsername = async (username: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
  } catch (error) {
    console.error('Error saving username:', error);
  }
};

// Get username
export const getUsername = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
};

// Check if username exists
export const hasUsername = async (): Promise<boolean> => {
  const username = await getUsername();
  return username !== null && username.trim() !== '';
};

// Save score to leaderboard
export const saveScore = async (username: string, score: number): Promise<void> => {
  try {
    // Get existing leaderboard
    const leaderboard = await getLeaderboard();
    
    // Add new entry
    const newEntry: LeaderboardEntry = {
      username,
      score,
      date: new Date().toISOString(),
    };
    
    // Add to leaderboard
    leaderboard.push(newEntry);
    
    // Sort by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Save updated leaderboard
    await AsyncStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Get leaderboard
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboardData = await AsyncStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return leaderboardData ? JSON.parse(leaderboardData) : [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

// Clear leaderboard (for testing)
export const clearLeaderboard = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
};

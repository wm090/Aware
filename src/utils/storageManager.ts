import { supabase } from '../lib/supabase';
import * as localStorage from './storage';
import * as supabaseStorage from './supabaseStorage';
import { LeaderboardEntry } from './storage';

// Check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Get username (from Supabase if authenticated, otherwise from local storage)
export const getUsername = async (): Promise<string | null> => {
  if (await isAuthenticated()) {
    return supabaseStorage.getUsername();
  } else {
    return localStorage.getUsername();
  }
};

// Save score (to Supabase if authenticated, otherwise to local storage)
export const saveScore = async (username: string, score: number): Promise<void> => {
  if (await isAuthenticated()) {
    return supabaseStorage.saveScore(username, score);
  } else {
    return localStorage.saveScore(username, score);
  }
};

// Get leaderboard (from Supabase if authenticated, otherwise from local storage)
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (await isAuthenticated()) {
    // Create a promise that will be resolved with the leaderboard data
    return new Promise((resolve) => {
      const unsubscribe = supabaseStorage.subscribeToLeaderboard((leaderboard) => {
        resolve(leaderboard);
        // Unsubscribe after getting the initial data
        unsubscribe();
      });
    });
  } else {
    return localStorage.getLeaderboard();
  }
};

// Subscribe to leaderboard updates (use Supabase if authenticated, otherwise just return local data)
export const subscribeToLeaderboard = (
  callback: (leaderboard: LeaderboardEntry[]) => void
): (() => void) => {
  // Check if authenticated and subscribe to real-time updates if so
  isAuthenticated().then((authenticated) => {
    if (authenticated) {
      return supabaseStorage.subscribeToLeaderboard(callback);
    } else {
      // Just fetch once from local storage
      localStorage.getLeaderboard().then(callback);
      // Return a no-op function since there's no real subscription
      return () => {};
    }
  });
  
  // Return a no-op function as placeholder
  return () => {};
};

// Clear user score (from Supabase if authenticated, otherwise from local storage)
export const clearUserScore = async (): Promise<void> => {
  const username = await getUsername();
  
  if (await isAuthenticated()) {
    return supabaseStorage.clearUserScore();
  } else {
    if (username) {
      return localStorage.clearUserScore(username);
    }
  }
};

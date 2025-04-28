import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from './storage'; // Import the existing type

// Get username from profile
export const getUsername = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Use maybeSingle instead of single to avoid error when no profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    // If no profile exists, create one with a default username
    if (!data) {
      const defaultUsername = `user_${user.id.substring(0, 8)}`;

      // Create a profile for the user
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, username: defaultUsername }]);

      if (insertError) throw insertError;

      return defaultUsername;
    }

    return data.username;
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
};

// Save score to leaderboard
export const saveScore = async (username: string, score: number): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No authenticated user, not saving score to Supabase');
      return;
    }

    // Convert the score to an integer (milliseconds to whole number)
    const intScore = Math.round(score);

    console.log(`Saving score ${intScore} (rounded from ${score}) for user ${user.id}`);

    // Ensure the user has a profile
    await getUsername(); // This will create a profile if it doesn't exist

    // Get the user's highest score
    const { data: existingScores, error: queryError } = await supabase
      .from('scores')
      .select('id, score')
      .eq('user_id', user.id)
      .order('score', { ascending: false });

    if (queryError) {
      console.error('Error querying scores:', queryError);
      throw queryError;
    }

    // Check if we should update the score
    const shouldUpdate = !existingScores ||
                         existingScores.length === 0 ||
                         (existingScores.length > 0 && intScore > existingScores[0].score);

    if (shouldUpdate) {
      if (existingScores && existingScores.length > 0) {
        console.log(`New high score! Updating from ${existingScores[0].score} to ${intScore}`);
      } else {
        console.log(`First score for user, setting to ${intScore}`);
      }

      // Check if we need to insert or update
      if (existingScores && existingScores.length > 0) {
        // Update existing score
        console.log(`Updating existing score record with ID ${existingScores[0].id}`);
        const { error: updateError } = await supabase
          .from('scores')
          .update({
            score: intScore,
            date: new Date().toISOString()
          })
          .eq('id', existingScores[0].id);

        if (updateError) {
          console.error('Error updating score:', updateError);
          throw updateError;
        }
      } else {
        // Insert new score
        console.log(`Inserting new score record for user ${user.id}`);
        const { error: insertError } = await supabase
          .from('scores')
          .insert({
            user_id: user.id,
            score: intScore,
            date: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting score:', insertError);
          throw insertError;
        }
      }

      console.log('Score saved successfully');
    } else {
      console.log(`Score ${intScore} is not higher than existing score ${existingScores[0].score}`);
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Get leaderboard with real-time updates
export const subscribeToLeaderboard = (
  callback: (leaderboard: LeaderboardEntry[]) => void
): (() => void) => {
  // Initial fetch
  fetchLeaderboard().then(callback);

  // Set up real-time subscription
  const subscription = supabase
    .channel('scores_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'scores' },
      () => {
        // When any change happens to scores, fetch the updated leaderboard
        fetchLeaderboard().then(callback);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// Fetch leaderboard data
const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // First, get all scores
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('id, user_id, score, date')
      .order('score', { ascending: false })
      .limit(100);

    if (scoresError) throw scoresError;
    if (!scores || scores.length === 0) return [];

    // Then, get usernames for each user_id
    const userIds = scores.map(score => score.user_id);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Create a map of user_id to username
    const usernameMap = new Map();
    profiles.forEach(profile => {
      usernameMap.set(profile.id, profile.username);
    });

    // Transform the data to match the LeaderboardEntry type
    return scores.map(item => ({
      username: usernameMap.get(item.user_id) || 'Unknown User',
      score: Number(item.score), // Ensure score is a number
      date: item.date,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

// Clear user score
export const clearUserScore = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing user score:', error);
  }
};

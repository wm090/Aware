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

    // Get the user's best score (highest value = longest survival time)
    const { data: existingScores, error: queryError } = await supabase
      .from('scores')
      .select('id, score')
      .eq('user_id', user.id)
      .order('score', { ascending: false }); // Descending order - highest score first

    if (queryError) {
      console.error('Error querying scores:', queryError);
      throw queryError;
    }

    console.log('Existing scores:', existingScores);

    // Check if we should update the score
    // In our game, higher scores are better (longer survival time)
    const shouldUpdate = !existingScores ||
                         existingScores.length === 0 ||
                         (existingScores.length > 0 && intScore > existingScores[0].score);

    if (shouldUpdate) {
      if (existingScores && existingScores.length > 0) {
        console.log(`New high score! Updating from ${existingScores[0].score} to ${intScore}`);
      } else {
        console.log(`First score for user, setting to ${intScore}`);
      }

      // Instead of trying to update, let's delete the old record and insert a new one
      // This approach is more reliable when dealing with potential permission issues
      if (existingScores && existingScores.length > 0) {
        console.log(`Found existing score record with ID ${existingScores[0].id}`);
        console.log(`Old score: ${existingScores[0].score}, New score: ${intScore}`);

        // First, delete the existing record
        console.log(`Deleting existing score record with ID ${existingScores[0].id}`);
        const { error: deleteError } = await supabase
          .from('scores')
          .delete()
          .eq('id', existingScores[0].id);

        if (deleteError) {
          console.error('Error deleting old score:', deleteError);
          // Continue anyway, try to insert the new score
        } else {
          console.log('Successfully deleted old score record');
        }
      }

      // Insert new score (whether we had an old one or not)
      console.log(`Inserting new score record for user ${user.id}`);

      const insertData = {
        user_id: user.id,
        score: intScore,
        date: new Date().toISOString()
      };
      console.log('Insert data:', insertData);

      const { data: insertResult, error: insertError } = await supabase
        .from('scores')
        .insert(insertData)
        .select();

      if (insertError) {
        console.error('Error inserting score:', insertError);
        throw insertError;
      }

      console.log('Insert result:', insertResult);

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
  console.log('Setting up leaderboard subscription...');

  // Initial fetch
  fetchLeaderboard().then(data => {
    console.log('Initial leaderboard fetch complete, updating UI');
    callback(data);
  });

  // Set up real-time subscription
  const subscription = supabase
    .channel('scores_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'scores' },
      (payload) => {
        console.log('Received real-time update from Supabase:', payload);
        // When any change happens to scores, fetch the updated leaderboard
        fetchLeaderboard().then(data => {
          console.log('Leaderboard updated due to real-time event');
          callback(data);
        });
      }
    )
    .subscribe();

  console.log('Leaderboard subscription set up successfully');

  // Return unsubscribe function
  return () => {
    console.log('Unsubscribing from leaderboard updates');
    subscription.unsubscribe();
  };
};

// Fetch leaderboard data
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    console.log('Fetching leaderboard data...');

    // First, get all scores (sorted by highest score first - longer survival time is better)
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('id, user_id, score, date')
      .order('score', { ascending: false }) // Descending order - highest score first
      .limit(100);

    if (scoresError) {
      console.error('Error fetching scores:', scoresError);
      throw scoresError;
    }

    console.log('Fetched scores:', scores);

    if (!scores || scores.length === 0) {
      console.log('No scores found');
      return [];
    }

    // Then, get usernames for each user_id
    const userIds = scores.map(score => score.user_id);
    console.log('User IDs to fetch:', userIds);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log('Fetched profiles:', profiles);

    // Create a map of user_id to username
    const usernameMap = new Map();
    profiles.forEach(profile => {
      usernameMap.set(profile.id, profile.username);
    });

    console.log('Username map:', Object.fromEntries(usernameMap));

    // Transform the data to match the LeaderboardEntry type
    const leaderboardEntries = scores.map(item => ({
      username: usernameMap.get(item.user_id) || 'Unknown User',
      score: Number(item.score), // Ensure score is a number
      date: item.date,
    }));

    console.log('Transformed leaderboard entries:', leaderboardEntries);
    return leaderboardEntries;
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

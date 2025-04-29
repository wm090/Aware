import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Define the context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  deleteAccount: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If user exists, ensure they have a profile
      if (session?.user) {
        ensureProfileExists(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If this is a sign-in or token-refreshed event and we have a user, ensure profile exists
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await ensureProfileExists(session.user);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check and create user profile if it doesn't exist
  const ensureProfileExists = async (user: User) => {
    if (!user) return;
    
    try {
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking profile:', error);
        return;
      }
      
      // If profile doesn't exist, create it
      if (!data) {
        const username = user.user_metadata?.username || `user_${user.id.substring(0, 8)}`;
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, username }]);
        
        if (insertError) {
          console.error('Error creating profile on login:', insertError);
        } else {
          console.log('Profile created successfully on login');
        }
      }
    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Store username in the auth metadata
          },
        },
      });

      if (error) throw error;

      // At this point, the user has been created but might need to confirm email
      // We'll try to insert the profile, but it's okay if it fails (we'll handle it on first login)
      if (data?.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, username }])
            .select();
            
          if (profileError) {
            console.log('Profile couldn\'t be created now, will create on first login', profileError);
            // Don't throw the error - we'll create the profile when they first login
          }
        } catch (profileInsertError) {
          console.log('Error creating profile during signup:', profileInsertError);
          // Continue with the signup flow - profile will be created on first login
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    try {
      if (!user) throw new Error('No user logged in');

      console.log('Deleting account for user:', user.id);

      // Call our RPC function that handles full account deletion
      const { data, error } = await supabase
        .rpc('delete_my_account');

      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }

      console.log('Account successfully deleted');
      
      // No need to manually sign out as the account is gone
      // but we should clear the local state
      setUser(null);
      setSession(null);

    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

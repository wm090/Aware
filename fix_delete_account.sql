-- Drop existing functions to create fresh ones
DROP FUNCTION IF EXISTS delete_my_account();
DROP FUNCTION IF EXISTS delete_user_complete(UUID);

-- Create a function to delete a user completely
CREATE OR REPLACE FUNCTION delete_user_complete(target_user_id UUID)
RETURNS BOOLEAN AS auth.users
BEGIN
  -- Delete from profiles table - using qualified column names
  DELETE FROM profiles WHERE profiles.id = target_user_id;
  
  -- Delete from scores table - using qualified column names
  DELETE FROM scores WHERE scores.user_id = target_user_id;
  
  -- Delete the user from auth.users - using qualified column names
  DELETE FROM auth.users WHERE auth.users.id = target_user_id;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error deleting user: %', SQLERRM;
  RETURN FALSE;
END;
auth.users LANGUAGE plpgsql SECURITY DEFINER;

-- Create a secure RPC that only allows users to delete their own accounts
CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS BOOLEAN AS auth.users
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Check if the user exists
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete the user
  PERFORM delete_user_complete(current_user_id);
  
  RETURN TRUE;
END;
auth.users LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION delete_my_account TO authenticated;

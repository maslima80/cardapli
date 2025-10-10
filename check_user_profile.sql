-- Replace '0deedb96-528a-4b86-a22a-9a12fa0708a4' with the actual user ID from the error message
DO $$
DECLARE
  user_id UUID := '0deedb96-528a-4b86-a22a-9a12fa0708a4';
  user_email TEXT;
BEGIN
  -- Check if user exists in auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RAISE NOTICE 'User with ID % does not exist in auth.users', user_id;
    RETURN;
  END IF;
  
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (user_id, user_email, NOW(), NOW());
    
    RAISE NOTICE 'Created profile for user % with email %', user_id, user_email;
  ELSE
    RAISE NOTICE 'Profile already exists for user % with email %', user_id, user_email;
  END IF;
END $$;

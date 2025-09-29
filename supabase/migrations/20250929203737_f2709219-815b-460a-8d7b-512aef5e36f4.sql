-- Add weekly_workout_goal column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN weekly_workout_goal integer DEFAULT 3;
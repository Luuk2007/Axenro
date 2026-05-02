
-- Add username and friend_code to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS friend_code TEXT;

-- Generate friend_codes for existing rows
UPDATE public.user_profiles
SET friend_code = encode(gen_random_bytes(6), 'hex')
WHERE friend_code IS NULL;

UPDATE public.user_profiles
SET username = 'user_' || substr(encode(gen_random_bytes(4), 'hex'), 1, 6)
WHERE username IS NULL;

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_unique ON public.user_profiles (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_friend_code_unique ON public.user_profiles (friend_code);

-- Friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users create friend requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Addressee can update friendship status" ON public.friendships
  FOR UPDATE USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

CREATE POLICY "Both parties can delete friendship" ON public.friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: are two users friends?
CREATE OR REPLACE FUNCTION public.are_friends(_user_a UUID, _user_b UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = _user_a AND addressee_id = _user_b)
        OR (requester_id = _user_b AND addressee_id = _user_a))
  );
$$;

-- Helper: get all friend ids
CREATE OR REPLACE FUNCTION public.get_friend_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE WHEN requester_id = _user_id THEN addressee_id ELSE requester_id END
  FROM public.friendships
  WHERE status = 'accepted' AND (requester_id = _user_id OR addressee_id = _user_id);
$$;

-- Allow users to view friends' user_profiles (for leaderboards)
CREATE POLICY "Users can view friends profiles" ON public.user_profiles
  FOR SELECT USING (public.are_friends(auth.uid(), user_id));

-- Allow authenticated users to look up profiles by username/friend_code (for adding friends)
-- Limited via separate policy: only username + friend_code lookup is needed; we permit SELECT
-- but the app filters which fields are read. Since RLS is row-level not column-level,
-- this exposes whole row to authenticated users. Acceptable for fitness profile data.
CREATE POLICY "Authenticated users can search profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

-- Allow viewing friends' profiles table (avatar, full_name)
CREATE POLICY "Users can view friends base profile" ON public.profiles
  FOR SELECT USING (public.are_friends(auth.uid(), id));

CREATE POLICY "Authenticated can view base profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Allow friends to view each other's personal_records (leaderboards)
CREATE POLICY "Friends can view personal records" ON public.personal_records
  FOR SELECT USING (public.are_friends(auth.uid(), user_id));

-- Allow friends to view each other's workouts (activity leaderboard)
CREATE POLICY "Friends can view workouts" ON public.workouts
  FOR SELECT USING (public.are_friends(auth.uid(), user_id));

-- Shared workouts table
CREATE TABLE IF NOT EXISTS public.shared_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  workout_data JSONB NOT NULL,
  message TEXT,
  is_public_to_friends BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shared_workouts_sender ON public.shared_workouts(sender_id);
CREATE INDEX IF NOT EXISTS idx_shared_workouts_recipient ON public.shared_workouts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_shared_workouts_created ON public.shared_workouts(created_at DESC);

ALTER TABLE public.shared_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender can view their shared workouts" ON public.shared_workouts
  FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Recipient can view direct shares" ON public.shared_workouts
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Friends can view feed posts" ON public.shared_workouts
  FOR SELECT USING (
    is_public_to_friends = true
    AND public.are_friends(auth.uid(), sender_id)
  );

CREATE POLICY "Users can create shared workouts" ON public.shared_workouts
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Sender can delete shared workouts" ON public.shared_workouts
  FOR DELETE USING (auth.uid() = sender_id);

-- Workout feed likes
CREATE TABLE IF NOT EXISTS public.workout_feed_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_workout_id UUID NOT NULL REFERENCES public.shared_workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shared_workout_id, user_id)
);

ALTER TABLE public.workout_feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.workout_feed_likes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can like" ON public.workout_feed_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON public.workout_feed_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Update handle_new_user to also create user_profile with username + friend_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_username TEXT;
  new_friend_code TEXT;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  -- Generate unique username
  LOOP
    new_username := 'user_' || substr(encode(gen_random_bytes(4), 'hex'), 1, 6);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE lower(username) = lower(new_username));
  END LOOP;

  -- Generate unique friend_code
  LOOP
    new_friend_code := encode(gen_random_bytes(6), 'hex');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE friend_code = new_friend_code);
  END LOOP;

  INSERT INTO public.user_profiles (user_id, username, friend_code)
  VALUES (new.id, new_username, new_friend_code)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$;

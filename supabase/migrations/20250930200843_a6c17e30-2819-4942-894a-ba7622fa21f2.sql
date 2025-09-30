-- Create enum types for challenges
CREATE TYPE challenge_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'abandoned');
CREATE TYPE badge_type AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE interaction_type AS ENUM ('like', 'comment', 'cheer');

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  difficulty_level challenge_difficulty NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'fitness',
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  badge_bronze_threshold NUMERIC NOT NULL DEFAULT 50,
  badge_silver_threshold NUMERIC NOT NULL DEFAULT 75,
  badge_gold_threshold NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_day INTEGER NOT NULL DEFAULT 0,
  status challenge_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, status)
);

-- Create challenge_progress table
CREATE TABLE public.challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_challenge_id UUID NOT NULL REFERENCES public.user_challenges(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_challenge_id, day_number)
);

-- Create challenge_badges table
CREATE TABLE public.challenge_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_percentage NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, badge_type)
);

-- Create challenge_interactions table
CREATE TABLE public.challenge_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_challenge_id UUID NOT NULL REFERENCES public.user_challenges(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  comment_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges table
CREATE POLICY "Anyone can view public challenges"
  ON public.challenges FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create their own challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own challenges"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own challenges"
  ON public.challenges FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS Policies for user_challenges table
CREATE POLICY "Users can view their own challenge participations"
  ON public.user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges"
  ON public.user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge participations"
  ON public.user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge participations"
  ON public.user_challenges FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for challenge_progress table
CREATE POLICY "Users can view their own progress"
  ON public.challenge_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_challenges
      WHERE user_challenges.id = challenge_progress.user_challenge_id
      AND user_challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own progress"
  ON public.challenge_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_challenges
      WHERE user_challenges.id = challenge_progress.user_challenge_id
      AND user_challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own progress"
  ON public.challenge_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_challenges
      WHERE user_challenges.id = challenge_progress.user_challenge_id
      AND user_challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own progress"
  ON public.challenge_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_challenges
      WHERE user_challenges.id = challenge_progress.user_challenge_id
      AND user_challenges.user_id = auth.uid()
    )
  );

-- RLS Policies for challenge_badges table
CREATE POLICY "Users can view their own badges"
  ON public.challenge_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view other users' badges"
  ON public.challenge_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert badges"
  ON public.challenge_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for challenge_interactions table
CREATE POLICY "Users can view interactions on their challenges"
  ON public.challenge_interactions FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = target_user_id OR
    EXISTS (
      SELECT 1 FROM public.user_challenges
      WHERE user_challenges.id = challenge_interactions.user_challenge_id
      AND user_challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create interactions"
  ON public.challenge_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON public.challenge_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_challenges_creator ON public.challenges(creator_id);
CREATE INDEX idx_challenges_public ON public.challenges(is_public);
CREATE INDEX idx_user_challenges_user ON public.user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge ON public.user_challenges(challenge_id);
CREATE INDEX idx_user_challenges_status ON public.user_challenges(status);
CREATE INDEX idx_challenge_progress_user_challenge ON public.challenge_progress(user_challenge_id);
CREATE INDEX idx_challenge_badges_user ON public.challenge_badges(user_id);
CREATE INDEX idx_challenge_interactions_target ON public.challenge_interactions(target_user_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenges_updated_at_trigger
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenges_updated_at();

CREATE TRIGGER update_user_challenges_updated_at_trigger
BEFORE UPDATE ON public.user_challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenges_updated_at();

-- Insert some default challenges
INSERT INTO public.challenges (title, description, duration_days, difficulty_level, category) VALUES
('14 Day Push-up Challenge', 'Build upper body strength with daily push-up routines. Start with your current level and progress each day.', 14, 'medium', 'fitness'),
('30 Day Plank Challenge', 'Strengthen your core with progressive plank holds. Perfect for building endurance and stability.', 30, 'hard', 'fitness'),
('7 Day No Sugar Challenge', 'Eliminate added sugars from your diet for one week. Improve energy and reset your taste buds.', 7, 'medium', 'nutrition'),
('21 Day Water Intake Challenge', 'Stay hydrated by drinking your daily water goal for 21 days straight. Build a lasting habit.', 21, 'easy', 'nutrition'),
('30 Day Squat Challenge', 'Build leg strength and improve mobility with daily squat variations.', 30, 'medium', 'fitness'),
('14 Day Morning Workout', 'Start your day right with 15-minute morning workouts. Boost energy and metabolism.', 14, 'easy', 'fitness'),
('10 Day Mindful Eating', 'Practice mindful eating habits and improve your relationship with food.', 10, 'easy', 'nutrition'),
('30 Day Consistency Challenge', 'Complete any workout 5 days per week for 30 days. Focus on building the habit.', 30, 'hard', 'fitness');
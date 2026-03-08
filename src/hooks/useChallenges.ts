import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: string;
  is_public: boolean;
  badge_bronze_threshold: number;
  badge_silver_threshold: number;
  badge_gold_threshold: number;
}

export interface UserChallenge {
  id: string;
  challenge_id: string;
  user_id: string;
  status: 'active' | 'completed' | 'abandoned';
  current_day: number;
  joined_at: string;
  completed_at: string | null;
  challenge?: Challenge;
}

export interface ChallengeProgress {
  id: string;
  user_challenge_id: string;
  day_number: number;
  completed_at: string;
  notes: string | null;
}

export interface ChallengeBadge {
  id: string;
  user_id: string;
  challenge_id: string;
  badge_type: 'bronze' | 'silver' | 'gold';
  completion_percentage: number;
  earned_at: string;
}

const DEFAULT_CHALLENGES: Omit<Challenge, 'id'>[] = [
  {
    title: '30 Day Push-Up Challenge',
    description: 'Complete push-ups every day for 30 days. Start with 10 and work your way up to 100!',
    duration_days: 30,
    difficulty_level: 'medium',
    category: 'strength',
    is_public: true,
    badge_bronze_threshold: 50,
    badge_silver_threshold: 75,
    badge_gold_threshold: 100,
  },
  {
    title: '7 Day Core Blast',
    description: 'A week of intense core workouts to strengthen your midsection.',
    duration_days: 7,
    difficulty_level: 'easy',
    category: 'strength',
    is_public: true,
    badge_bronze_threshold: 50,
    badge_silver_threshold: 75,
    badge_gold_threshold: 100,
  },
  {
    title: '21 Day Consistency',
    description: 'Work out at least once every day for 21 days to build a lasting habit.',
    duration_days: 21,
    difficulty_level: 'medium',
    category: 'fitness',
    is_public: true,
    badge_bronze_threshold: 50,
    badge_silver_threshold: 75,
    badge_gold_threshold: 100,
  },
  {
    title: '14 Day Squat Challenge',
    description: 'Master the squat with progressive overload over 14 days.',
    duration_days: 14,
    difficulty_level: 'medium',
    category: 'legs',
    is_public: true,
    badge_bronze_threshold: 50,
    badge_silver_threshold: 75,
    badge_gold_threshold: 100,
  },
  {
    title: '30 Day Plank Challenge',
    description: 'Hold a plank every day, increasing time from 30 seconds to 5 minutes.',
    duration_days: 30,
    difficulty_level: 'hard',
    category: 'core',
    is_public: true,
    badge_bronze_threshold: 50,
    badge_silver_threshold: 75,
    badge_gold_threshold: 100,
  },
  {
    title: '7 Day Stretching',
    description: 'Improve flexibility with daily 15-minute stretch routines.',
    duration_days: 7,
    difficulty_level: 'easy',
    category: 'flexibility',
    is_public: true,
    badge_bronze_threshold: 50,
    badge_silver_threshold: 75,
    badge_gold_threshold: 100,
  },
];

export function useChallenges() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<Record<string, ChallengeProgress[]>>({});
  const [badges, setBadges] = useState<ChallengeBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges:', error);
      return;
    }

    // Seed defaults if empty
    if (!data || data.length === 0) {
      const { data: seeded } = await supabase
        .from('challenges')
        .insert(DEFAULT_CHALLENGES.map(c => ({ ...c, creator_id: null })))
        .select();
      if (seeded) setChallenges(seeded as Challenge[]);
    } else {
      setChallenges(data as Challenge[]);
    }
  }, []);

  const fetchUserChallenges = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching user challenges:', error);
      return;
    }
    setUserChallenges(data as UserChallenge[]);
  }, [user]);

  const fetchProgress = useCallback(async () => {
    if (!user || userChallenges.length === 0) return;
    const ucIds = userChallenges.map(uc => uc.id);
    const { data } = await supabase
      .from('challenge_progress')
      .select('*')
      .in('user_challenge_id', ucIds)
      .order('day_number', { ascending: true });

    if (data) {
      const grouped: Record<string, ChallengeProgress[]> = {};
      data.forEach((p: any) => {
        if (!grouped[p.user_challenge_id]) grouped[p.user_challenge_id] = [];
        grouped[p.user_challenge_id].push(p as ChallengeProgress);
      });
      setChallengeProgress(grouped);
    }
  }, [user, userChallenges]);

  const fetchBadges = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('challenge_badges')
      .select('*')
      .eq('user_id', user.id);
    if (data) setBadges(data as ChallengeBadge[]);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchChallenges();
      await fetchUserChallenges();
      await fetchBadges();
      setLoading(false);
    };
    load();
  }, [fetchChallenges, fetchUserChallenges, fetchBadges]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_challenges').insert({
      challenge_id: challengeId,
      user_id: user.id,
      status: 'active',
      current_day: 0,
    });
    if (error) {
      toast.error(t('Error joining challenge') || 'Error joining challenge');
      return;
    }
    toast.success(t('Challenge joined!') || 'Challenge joined!');
    await fetchUserChallenges();
  };

  const logDay = async (userChallengeId: string, dayNumber: number, notes?: string) => {
    if (!user) return;

    const { error } = await supabase.from('challenge_progress').insert({
      user_challenge_id: userChallengeId,
      day_number: dayNumber,
      notes: notes || null,
    });

    if (error) {
      toast.error('Error logging progress');
      return;
    }

    // Update current_day
    await supabase.from('user_challenges').update({ current_day: dayNumber }).eq('id', userChallengeId);

    // Check if challenge is complete
    const uc = userChallenges.find(u => u.id === userChallengeId);
    const challenge = challenges.find(c => c.id === uc?.challenge_id);
    if (challenge && dayNumber >= challenge.duration_days) {
      await supabase.from('user_challenges').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', userChallengeId);

      // Award gold badge
      await supabase.from('challenge_badges').insert({
        user_id: user.id,
        challenge_id: challenge.id,
        badge_type: 'gold',
        completion_percentage: 100,
      });

      toast.success('🏆 Challenge completed!');
    } else {
      toast.success('Day logged! 💪');
    }

    await fetchUserChallenges();
    await fetchProgress();
    await fetchBadges();
  };

  const abandonChallenge = async (userChallengeId: string) => {
    if (!user) return;

    const uc = userChallenges.find(u => u.id === userChallengeId);
    const challenge = challenges.find(c => c.id === uc?.challenge_id);
    const progress = challengeProgress[userChallengeId] || [];
    const pct = challenge ? (progress.length / challenge.duration_days) * 100 : 0;

    // Award partial badges
    if (challenge && pct >= challenge.badge_bronze_threshold) {
      const badgeType = pct >= challenge.badge_gold_threshold ? 'gold' :
                        pct >= challenge.badge_silver_threshold ? 'silver' : 'bronze';
      await supabase.from('challenge_badges').insert({
        user_id: user.id,
        challenge_id: challenge.id,
        badge_type: badgeType,
        completion_percentage: pct,
      });
    }

    await supabase.from('user_challenges').update({
      status: 'abandoned',
    }).eq('id', userChallengeId);

    toast.success(t('Challenge abandoned') || 'Challenge abandoned');
    await fetchUserChallenges();
    await fetchBadges();
  };

  return {
    challenges,
    userChallenges,
    challengeProgress,
    badges,
    loading,
    joinChallenge,
    logDay,
    abandonChallenge,
  };
}

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

const CHALLENGE_KEYS = [
  { titleKey: 'chTitle_pushup30', descKey: 'chDesc_pushup30', duration_days: 30, difficulty_level: 'medium' as const, category: 'strength' },
  { titleKey: 'chTitle_core7', descKey: 'chDesc_core7', duration_days: 7, difficulty_level: 'easy' as const, category: 'core' },
  { titleKey: 'chTitle_consistency21', descKey: 'chDesc_consistency21', duration_days: 21, difficulty_level: 'medium' as const, category: 'fitness' },
  { titleKey: 'chTitle_squat14', descKey: 'chDesc_squat14', duration_days: 14, difficulty_level: 'medium' as const, category: 'legs' },
  { titleKey: 'chTitle_plank30', descKey: 'chDesc_plank30', duration_days: 30, difficulty_level: 'hard' as const, category: 'core' },
  { titleKey: 'chTitle_stretch7', descKey: 'chDesc_stretch7', duration_days: 7, difficulty_level: 'easy' as const, category: 'flexibility' },
  { titleKey: 'chTitle_running10', descKey: 'chDesc_running10', duration_days: 10, difficulty_level: 'easy' as const, category: 'cardio' },
  { titleKey: 'chTitle_pullup14', descKey: 'chDesc_pullup14', duration_days: 14, difficulty_level: 'hard' as const, category: 'strength' },
  { titleKey: 'chTitle_fullbody30', descKey: 'chDesc_fullbody30', duration_days: 30, difficulty_level: 'hard' as const, category: 'full_body' },
  { titleKey: 'chTitle_mobility7', descKey: 'chDesc_mobility7', duration_days: 7, difficulty_level: 'easy' as const, category: 'mobility' },
  { titleKey: 'chTitle_morning14', descKey: 'chDesc_morning14', duration_days: 14, difficulty_level: 'easy' as const, category: 'fitness' },
  { titleKey: 'chTitle_water21', descKey: 'chDesc_water21', duration_days: 21, difficulty_level: 'easy' as const, category: 'nutrition' },
  { titleKey: 'chTitle_squat30', descKey: 'chDesc_squat30', duration_days: 30, difficulty_level: 'medium' as const, category: 'legs' },
  { titleKey: 'chTitle_nosugar7', descKey: 'chDesc_nosugar7', duration_days: 7, difficulty_level: 'medium' as const, category: 'nutrition' },
  { titleKey: 'chTitle_pushup14', descKey: 'chDesc_pushup14', duration_days: 14, difficulty_level: 'medium' as const, category: 'strength' },
  { titleKey: 'chTitle_meditation10', descKey: 'chDesc_meditation10', duration_days: 10, difficulty_level: 'easy' as const, category: 'recovery' },
  { titleKey: 'chTitle_upperbody21', descKey: 'chDesc_upperbody21', duration_days: 21, difficulty_level: 'hard' as const, category: 'upper_body' },
  { titleKey: 'chTitle_cardio30', descKey: 'chDesc_cardio30', duration_days: 30, difficulty_level: 'hard' as const, category: 'endurance' },
];

const DEFAULT_CHALLENGES: Omit<Challenge, 'id'>[] = CHALLENGE_KEYS.map(k => ({
  title: k.titleKey,
  description: k.descKey,
  duration_days: k.duration_days,
  difficulty_level: k.difficulty_level,
  category: k.category,
  is_public: true,
  badge_bronze_threshold: 50,
  badge_silver_threshold: 75,
  badge_gold_threshold: 100,
}));

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

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Challenge } from './useChallenges';

export interface ChallengeBadge {
  id: string;
  user_id: string;
  challenge_id: string;
  badge_type: 'bronze' | 'silver' | 'gold';
  earned_at: string;
  completion_percentage: number;
  created_at: string;
  challenge?: Challenge;
}

export const useChallengeBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<ChallengeBadge[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBadges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenge_badges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const awardBadge = async (
    challengeId: string, 
    badgeType: 'bronze' | 'silver' | 'gold',
    completionPercentage: number
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_badges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          badge_type: badgeType,
          completion_percentage: completionPercentage
        })
        .select()
        .single();

      if (error) throw error;
      
      const badgeEmoji = badgeType === 'gold' ? '🥇' : badgeType === 'silver' ? '🥈' : '🥉';
      toast.success(`${badgeEmoji} You earned a ${badgeType} badge!`);
      await loadBadges();
      return data;
    } catch (error: any) {
      if (!error.message?.includes('unique')) {
        console.error('Error awarding badge:', error);
      }
    }
  };

  const checkAndAwardBadges = async (
    challengeId: string,
    completedDays: number,
    totalDays: number,
    thresholds: {
      bronze: number;
      silver: number;
      gold: number;
    }
  ) => {
    const completionPercentage = (completedDays / totalDays) * 100;

    // Check existing badges for this challenge
    const { data: existingBadges } = await supabase
      .from('challenge_badges')
      .select('badge_type')
      .eq('user_id', user?.id)
      .eq('challenge_id', challengeId);

    const hasBronze = existingBadges?.some(b => b.badge_type === 'bronze');
    const hasSilver = existingBadges?.some(b => b.badge_type === 'silver');
    const hasGold = existingBadges?.some(b => b.badge_type === 'gold');

    // Award badges based on completion percentage
    if (completionPercentage >= thresholds.gold && !hasGold) {
      await awardBadge(challengeId, 'gold', completionPercentage);
    } else if (completionPercentage >= thresholds.silver && !hasSilver) {
      await awardBadge(challengeId, 'silver', completionPercentage);
    } else if (completionPercentage >= thresholds.bronze && !hasBronze) {
      await awardBadge(challengeId, 'bronze', completionPercentage);
    }
  };

  useEffect(() => {
    loadBadges();

    if (!user) return;

    const channel = supabase
      .channel('challenge-badges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_badges',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadBadges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    badges,
    loading,
    awardBadge,
    checkAndAwardBadges,
    loadBadges
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Challenge } from './useChallenges';

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  joined_at: string;
  completed_at: string | null;
  current_day: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
  challenge?: Challenge;
}

export const useUserChallenges = () => {
  const { user } = useAuth();
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserChallenges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setUserChallenges(data || []);
    } catch (error) {
      console.error('Error loading user challenges:', error);
      toast.error('Failed to load your challenges');
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a challenge');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Successfully joined the challenge!');
      await loadUserChallenges();
      return data;
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      if (error.message?.includes('unique')) {
        toast.error('You are already participating in this challenge');
      } else {
        toast.error('Failed to join challenge');
      }
    }
  };

  const abandonChallenge = async (userChallengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({ status: 'abandoned' })
        .eq('id', userChallengeId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Challenge marked as abandoned');
      await loadUserChallenges();
    } catch (error) {
      console.error('Error abandoning challenge:', error);
      toast.error('Failed to abandon challenge');
    }
  };

  const completeChallenge = async (userChallengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', userChallengeId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('🎉 Congratulations on completing the challenge!');
      await loadUserChallenges();
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error('Failed to complete challenge');
    }
  };

  useEffect(() => {
    loadUserChallenges();

    if (!user) return;

    const channel = supabase
      .channel('user-challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_challenges',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUserChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    userChallenges,
    loading,
    joinChallenge,
    abandonChallenge,
    completeChallenge,
    loadUserChallenges
  };
};

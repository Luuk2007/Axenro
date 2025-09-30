import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ChallengeProgress {
  id: string;
  user_challenge_id: string;
  day_number: number;
  completed_at: string;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export const useChallengeProgress = (userChallengeId?: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProgress = async () => {
    if (!user || !userChallengeId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_challenge_id', userChallengeId)
        .order('day_number', { ascending: true });

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const checkInDay = async (dayNumber: number, notes?: string, photoUrl?: string) => {
    if (!user || !userChallengeId) return;

    try {
      const { data, error } = await supabase
        .from('challenge_progress')
        .insert({
          user_challenge_id: userChallengeId,
          day_number: dayNumber,
          notes,
          photo_url: photoUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Update current_day in user_challenges
      await supabase
        .from('user_challenges')
        .update({ current_day: dayNumber })
        .eq('id', userChallengeId);
      
      toast.success(`Day ${dayNumber} completed! 🎉`);
      await loadProgress();
      return data;
    } catch (error: any) {
      console.error('Error checking in:', error);
      if (error.message?.includes('unique')) {
        toast.error('You already checked in for this day');
      } else {
        toast.error('Failed to check in');
      }
    }
  };

  const updateProgress = async (progressId: string, notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenge_progress')
        .update({ notes })
        .eq('id', progressId);

      if (error) throw error;
      
      toast.success('Progress updated');
      await loadProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  useEffect(() => {
    loadProgress();

    if (!user || !userChallengeId) return;

    const channel = supabase
      .channel(`challenge-progress-${userChallengeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_progress',
          filter: `user_challenge_id=eq.${userChallengeId}`
        },
        () => {
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userChallengeId]);

  return {
    progress,
    loading,
    checkInDay,
    updateProgress,
    loadProgress
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: string;
  creator_id: string | null;
  is_public: boolean;
  badge_bronze_threshold: number;
  badge_silver_threshold: number;
  badge_gold_threshold: number;
  created_at: string;
  updated_at: string;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChallenges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (challengeData: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('You must be logged in to create a challenge');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          ...challengeData,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Challenge created successfully!');
      await loadChallenges();
      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge');
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
        .eq('creator_id', user.id);

      if (error) throw error;
      
      toast.success('Challenge deleted successfully');
      await loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  useEffect(() => {
    loadChallenges();

    if (!user) return;

    const channel = supabase
      .channel('challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges'
        },
        () => {
          loadChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    challenges,
    loading,
    createChallenge,
    deleteChallenge,
    loadChallenges
  };
};

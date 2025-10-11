import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAIAvatar = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarStatus, setAvatarStatus] = useState<string>('pending');
  const [motivation, setMotivation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadAvatar = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('ai_avatar_url, ai_avatar_status, last_motivation_message, last_motivation_generated_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setAvatarUrl(data?.ai_avatar_url || '');
      setAvatarStatus(data?.ai_avatar_status || 'pending');
      setMotivation(data?.last_motivation_message || '');

      // Check if motivation needs refresh (older than 6 hours)
      if (data?.last_motivation_generated_at) {
        const lastGenerated = new Date(data.last_motivation_generated_at);
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        
        if (lastGenerated < sixHoursAgo && data?.ai_avatar_url) {
          // Refresh in background
          refreshMotivation();
        }
      } else if (data?.ai_avatar_url) {
        // No motivation yet but has avatar, generate one
        refreshMotivation();
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  const generateAvatar = async (profilePictureUrl: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setAvatarStatus('generating');

      const { data, error } = await supabase.functions.invoke('generate-ai-avatar', {
        body: { profilePictureUrl }
      });

      if (error) throw error;

      if (data?.success) {
        setAvatarUrl(data.avatarUrl);
        setAvatarStatus('completed');
        toast.success('Your AI Coach avatar is ready!');
        
        // Generate initial motivation
        refreshMotivation();
      } else {
        throw new Error(data?.error || 'Failed to generate avatar');
      }
    } catch (error: any) {
      console.error('Error generating avatar:', error);
      setAvatarStatus('failed');
      toast.error('Failed to generate avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshMotivation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-avatar-motivation');

      if (error) throw error;

      if (data?.success) {
        setMotivation(data.motivation);
      }
    } catch (error) {
      console.error('Error refreshing motivation:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadAvatar();
    }
  }, [user]);

  return {
    avatarUrl,
    avatarStatus,
    motivation,
    loading,
    generateAvatar,
    refreshMotivation,
  };
};

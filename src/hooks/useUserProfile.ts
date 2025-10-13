import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProfileData {
  name?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: string;
  fitness_goal?: string;
  target_weight?: number;
  exercise_frequency?: string;
  weekly_workout_goal?: number;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    if (!user) {
      // Clear profile when not authenticated
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        const profileData: UserProfileData = {
          name: data.name,
          gender: data.gender as 'male' | 'female' | 'other',
          age: data.age,
          height: data.height,
          weight: data.weight,
          activity_level: data.activity_level,
          fitness_goal: data.fitness_goal,
          target_weight: data.target_weight,
          exercise_frequency: data.exercise_frequency,
          weekly_workout_goal: (data as any).weekly_workout_goal,
        };
        setProfile(profileData);
        
        // Keep localStorage as backup for offline access
        localStorage.setItem("userProfile", JSON.stringify(profileData));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: UserProfileData) => {
    if (!user) {
      toast.error("Please log in to save your profile");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          name: profileData.name,
          gender: profileData.gender,
          age: profileData.age,
          height: profileData.height,
          weight: profileData.weight,
          activity_level: profileData.activity_level,
          fitness_goal: profileData.fitness_goal,
          target_weight: profileData.target_weight,
          exercise_frequency: profileData.exercise_frequency,
          weekly_workout_goal: profileData.weekly_workout_goal,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save profile');
        return;
      }

      setProfile(profileData);
      
      // Also save to localStorage as backup
      localStorage.setItem("userProfile", JSON.stringify(profileData));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  return {
    profile,
    loading,
    saveProfile,
    loadProfile
  };
};

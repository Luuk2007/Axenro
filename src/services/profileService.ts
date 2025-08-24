
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormValues } from '@/components/profile/ProfileForm';

export const profileService = {
  // Get user profile data
  async getProfile(): Promise<ProfileFormValues | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) return null;

    // Convert Supabase data to ProfileFormValues format
    return {
      fullName: data.full_name || '',
      age: data.age || 0,
      weight: data.weight || 0,
      height: data.height || 0,
      gender: data.gender || '',
      activityLevel: data.activity_level || '',
      goal: data.fitness_goal || '',
      exerciseFrequency: data.exercise_frequency || '',
      dateOfBirth: data.date_of_birth || '',
    };
  },

  // Save user profile data
  async saveProfile(profile: ProfileFormValues): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.user.id,
        full_name: profile.fullName,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        gender: profile.gender,
        activity_level: profile.activityLevel,
        fitness_goal: profile.goal,
        exercise_frequency: profile.exerciseFrequency,
        date_of_birth: profile.dateOfBirth,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving profile:', error);
      return false;
    }

    return true;
  },

  // Migrate localStorage profile data to Supabase
  async migrateLocalStorageProfile(): Promise<void> {
    const localProfile = localStorage.getItem('userProfile');
    
    if (!localProfile) return;

    try {
      const profile: ProfileFormValues = JSON.parse(localProfile);
      const success = await this.saveProfile(profile);
      
      if (success) {
        // Clear localStorage after successful migration
        localStorage.removeItem('userProfile');
      }
    } catch (error) {
      console.error('Error migrating profile data:', error);
    }
  }
};

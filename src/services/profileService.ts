
import { supabase } from '@/integrations/supabase/client';

// Define the ProfileFormValues interface to match the form
export interface ProfileFormValues {
  fullName: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  goal: string;
  exerciseFrequency: string;
  dateOfBirth: string;
  targetWeight?: number;
}

export const profileService = {
  // Get user profile data
  async getProfile(): Promise<ProfileFormValues | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    // For now, we'll work with the existing profiles table structure
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

    // Convert basic profile data to ProfileFormValues format
    // Since the extended fields don't exist yet, we'll return defaults
    return {
      fullName: data.full_name || '',
      age: 0,
      weight: 0,
      height: 0,
      gender: '',
      activityLevel: '',
      goal: '',
      exerciseFrequency: '',
      dateOfBirth: '',
      targetWeight: undefined,
    };
  },

  // Save user profile data
  async saveProfile(profile: ProfileFormValues): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    // For now, only update the full_name in the existing profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.user.id,
        full_name: profile.fullName,
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

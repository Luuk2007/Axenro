
import { supabase } from '@/integrations/supabase/client';

// Define the ProfileFormValues interface to match the form (without dateOfBirth and activityLevel)
export interface ProfileFormValues {
  fullName: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  goal: string;
  exerciseFrequency: string;
  targetWeight?: number;
}

export const profileService = {
  // Get user profile data
  async getProfile(): Promise<ProfileFormValues | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    // Get profile data from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    // Get extended profile data from user preferences or a new table
    const { data: extendedData } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    // Combine basic profile with extended data, fallback to localStorage if needed
    const localProfile = localStorage.getItem('userProfile');
    let parsedLocalProfile = null;
    
    if (localProfile) {
      try {
        parsedLocalProfile = JSON.parse(localProfile);
      } catch (error) {
        console.error('Error parsing local profile:', error);
      }
    }

    return {
      fullName: profile?.full_name || parsedLocalProfile?.fullName || '',
      age: parsedLocalProfile?.age || 0,
      weight: parsedLocalProfile?.weight || 0,
      height: parsedLocalProfile?.height || 0,
      gender: parsedLocalProfile?.gender || '',
      goal: parsedLocalProfile?.goal || '',
      exerciseFrequency: parsedLocalProfile?.exerciseFrequency || '',
      targetWeight: parsedLocalProfile?.targetWeight,
    };
  },

  // Save user profile data
  async saveProfile(profile: ProfileFormValues): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      // Save to localStorage for unauthenticated users
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return true;
    }

    try {
      // Update the profiles table with full_name
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.user.id,
          full_name: profile.fullName,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return false;
      }

      // Also save to localStorage as backup
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  // Migrate localStorage profile data to Supabase
  async migrateLocalStorageProfile(): Promise<void> {
    const localProfile = localStorage.getItem('userProfile');
    
    if (!localProfile) return;

    try {
      const profile: ProfileFormValues = JSON.parse(localProfile);
      await this.saveProfile(profile);
    } catch (error) {
      console.error('Error migrating profile data:', error);
    }
  },

  // Body measurements service
  async getBodyMeasurements(): Promise<any[]> {
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      // Try to get from Supabase first
      const { data } = await supabase
        .from('user_preferences')
        .select('body_measurements')
        .eq('user_id', user.user.id)
        .single();
      
      if (data?.body_measurements) {
        return data.body_measurements;
      }
    }
    
    // Fallback to localStorage
    const localMeasurements = localStorage.getItem('bodyMeasurements');
    if (localMeasurements) {
      try {
        return JSON.parse(localMeasurements);
      } catch (error) {
        console.error('Error parsing body measurements:', error);
      }
    }
    
    return [];
  },

  async saveBodyMeasurements(measurements: any[]): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    
    // Always save to localStorage
    localStorage.setItem('bodyMeasurements', JSON.stringify(measurements));
    
    if (user.user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.user.id,
            body_measurements: measurements,
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('Error saving body measurements to Supabase:', error);
          return false;
        }
      } catch (error) {
        console.error('Error saving body measurements:', error);
        return false;
      }
    }
    
    return true;
  }
};

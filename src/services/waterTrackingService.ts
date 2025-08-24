
import { supabase } from '@/integrations/supabase/client';

export interface WaterEntry {
  id: string;
  amount: number;
  timestamp: number;
}

export const waterTrackingService = {
  // Get water logs for a specific date
  async getWaterLogs(date: string): Promise<WaterEntry[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      // Fallback to localStorage for unauthenticated users
      return this.getLocalStorageWaterLogs(date);
    }

    // For now, return empty array since water_logs table doesn't exist yet
    // This will be updated once the database migration is approved
    console.log('Water logs from Supabase not available yet, using localStorage');
    return this.getLocalStorageWaterLogs(date);
  },

  // Add water entry
  async addWaterEntry(amount: number): Promise<WaterEntry | null> {
    const { data: user } = await supabase.auth.getUser();
    const now = new Date();
    
    if (!user.user) {
      // Fallback to localStorage for unauthenticated users
      return this.addLocalStorageWaterEntry(amount);
    }

    // For now, use localStorage until database migration is approved
    console.log('Adding to localStorage until Supabase water_logs table is available');
    return this.addLocalStorageWaterEntry(amount);
  },

  // Delete water entry
  async deleteWaterEntry(id: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      // Fallback to localStorage for unauthenticated users
      return this.deleteLocalStorageWaterEntry(id);
    }

    // For now, use localStorage until database migration is approved
    console.log('Deleting from localStorage until Supabase water_logs table is available');
    return this.deleteLocalStorageWaterEntry(id);
  },

  // localStorage helper methods
  getLocalStorageWaterLogs(date: string): WaterEntry[] {
    const localData = localStorage.getItem(`waterLog_${date}`);
    if (!localData) return [];

    try {
      return JSON.parse(localData);
    } catch (error) {
      console.error('Error parsing localStorage water data:', error);
      return [];
    }
  },

  addLocalStorageWaterEntry(amount: number): WaterEntry {
    const now = new Date();
    const today = now.toLocaleDateString('en-US');
    const entry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: now.getTime(),
    };

    const existingData = this.getLocalStorageWaterLogs(today);
    existingData.push(entry);
    localStorage.setItem(`waterLog_${today}`, JSON.stringify(existingData));
    
    return entry;
  },

  deleteLocalStorageWaterEntry(id: string): boolean {
    const today = new Date().toLocaleDateString('en-US');
    const existingData = this.getLocalStorageWaterLogs(today);
    const filteredData = existingData.filter(entry => entry.id !== id);
    
    localStorage.setItem(`waterLog_${today}`, JSON.stringify(filteredData));
    return true;
  },

  // Migrate localStorage data to Supabase (placeholder for now)
  async migrateLocalStorageData(): Promise<void> {
    console.log('Water data migration will be available once Supabase table is created');
    // This will be implemented once the water_logs table exists
  }
};

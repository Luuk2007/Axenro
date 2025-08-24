
import { supabase } from '@/integrations/supabase/client';

export interface WaterEntry {
  id: string;
  amount: number;
  timestamp: number;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount: number;
  logged_at: string;
  created_at: string;
}

export const waterTrackingService = {
  // Get water logs for a specific date
  async getWaterLogs(date: string): Promise<WaterEntry[]> {
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`)
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Error fetching water logs:', error);
      return [];
    }

    return (data || []).map(log => ({
      id: log.id,
      amount: log.amount,
      timestamp: new Date(log.logged_at).getTime(),
    }));
  },

  // Add water entry
  async addWaterEntry(amount: number): Promise<WaterEntry | null> {
    const now = new Date();
    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        amount,
        logged_at: now.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding water entry:', error);
      return null;
    }

    return {
      id: data.id,
      amount: data.amount,
      timestamp: new Date(data.logged_at).getTime(),
    };
  },

  // Delete water entry
  async deleteWaterEntry(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Error deleting water entry:', error);
      return false;
    }

    return true;
  },

  // Migrate localStorage data to Supabase
  async migrateLocalStorageData(): Promise<void> {
    const today = new Date().toLocaleDateString('en-US');
    const localData = localStorage.getItem(`waterLog_${today}`);
    
    if (!localData) return;

    try {
      const waterLog: WaterEntry[] = JSON.parse(localData);
      
      for (const entry of waterLog) {
        await this.addWaterEntry(entry.amount);
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem(`waterLog_${today}`);
    } catch (error) {
      console.error('Error migrating water data:', error);
    }
  }
};

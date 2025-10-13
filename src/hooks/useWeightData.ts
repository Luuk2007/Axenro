import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WeightEntry {
  date: string;
  value: number;
}

export const useWeightData = () => {
  const { user } = useAuth();
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWeightData = async () => {
    if (!user) {
      // Clear weight data when not authenticated
      setWeightData([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weight_data')
        .select('date, weight')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading weight data:', error);
        return;
      }

      if (data) {
        const formattedData = data.map(item => ({
          date: item.date,
          value: Number(item.weight)
        }));
        setWeightData(formattedData);
        
        // Keep localStorage as backup
        localStorage.setItem("weightData", JSON.stringify(formattedData));
      }
    } catch (error) {
      console.error('Error loading weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWeightEntry = async (entry: WeightEntry) => {
    if (!user) {
      toast.error('Please log in to add weight entries');
      return;
    }

    const updatedData = [...weightData, entry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setWeightData(updatedData);

    try {
      const { error } = await supabase
        .from('weight_data')
        .upsert({
          user_id: user.id,
          date: entry.date,
          weight: entry.value
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error('Error saving weight data:', error);
        toast.error('Failed to save weight entry');
        return;
      }

      // Also save to localStorage as backup
      localStorage.setItem("weightData", JSON.stringify(updatedData));
      
      toast.success('Weight entry saved successfully');
    } catch (error) {
      console.error('Error saving weight data:', error);
      toast.error('Failed to save weight entry');
    }
  };

  const updateWeightEntry = async (date: string, newWeight: number) => {
    if (!user) {
      toast.error('Please log in to update weight entries');
      return;
    }

    const updatedData = weightData.map(entry => 
      entry.date === date ? { ...entry, value: newWeight } : entry
    );
    
    setWeightData(updatedData);

    try {
      const { error } = await supabase
        .from('weight_data')
        .update({ weight: newWeight })
        .eq('user_id', user.id)
        .eq('date', date);

      if (error) {
        console.error('Error updating weight data:', error);
        toast.error('Failed to update weight entry');
        return;
      }

      localStorage.setItem("weightData", JSON.stringify(updatedData));
      toast.success('Weight entry updated successfully');
    } catch (error) {
      console.error('Error updating weight data:', error);
      toast.error('Failed to update weight entry');
    }
  };

  const deleteWeightEntry = async (date: string) => {
    if (!user) {
      toast.error('Please log in to delete weight entries');
      return;
    }

    const updatedData = weightData.filter(entry => entry.date !== date);
    setWeightData(updatedData);

    try {
      const { error } = await supabase
        .from('weight_data')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (error) {
        console.error('Error deleting weight data:', error);
        toast.error('Failed to delete weight entry');
        return;
      }

      localStorage.setItem("weightData", JSON.stringify(updatedData));
      toast.success('Weight entry deleted successfully');
    } catch (error) {
      console.error('Error deleting weight data:', error);
      toast.error('Failed to delete weight entry');
    }
  };

  useEffect(() => {
    loadWeightData();
  }, [user]);

  return {
    weightData,
    loading,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    loadWeightData
  };
};

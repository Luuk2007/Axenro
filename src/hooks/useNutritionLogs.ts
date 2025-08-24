
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NutritionLogEntry {
  id: string;
  date: string;
  mealType: string;
  foodData: any;
}

export const useNutritionLogs = () => {
  const { user } = useAuth();
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNutritionLogs = async (date?: string) => {
    if (!user) {
      // For non-authenticated users, load from localStorage
      const today = date || new Date().toISOString().split('T')[0];
      const savedLogs = localStorage.getItem(`nutritionLogs_${today}`);
      if (savedLogs) {
        try {
          const parsedLogs = JSON.parse(savedLogs);
          setNutritionLogs(parsedLogs);
        } catch (error) {
          console.error('Error parsing nutrition logs:', error);
        }
      }
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id);

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading nutrition logs:', error);
        return;
      }

      if (data) {
        const formattedLogs = data.map(item => ({
          id: item.id,
          date: item.date,
          mealType: item.meal_type,
          foodData: item.food_data
        }));
        setNutritionLogs(formattedLogs);
      }
    } catch (error) {
      console.error('Error loading nutrition logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNutritionLog = async (logEntry: Omit<NutritionLogEntry, 'id'>) => {
    if (!user) {
      // For non-authenticated users, save to localStorage
      const newEntry = { ...logEntry, id: Date.now().toString() };
      const updatedLogs = [...nutritionLogs, newEntry];
      setNutritionLogs(updatedLogs);
      localStorage.setItem(`nutritionLogs_${logEntry.date}`, JSON.stringify(updatedLogs));
      return newEntry;
    }

    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: user.id,
          date: logEntry.date,
          meal_type: logEntry.mealType,
          food_data: logEntry.foodData
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving nutrition log:', error);
        toast.error('Failed to save nutrition log');
        return null;
      }

      const newEntry = {
        id: data.id,
        date: data.date,
        mealType: data.meal_type,
        foodData: data.food_data
      };

      setNutritionLogs(prev => [...prev, newEntry]);
      return newEntry;
    } catch (error) {
      console.error('Error saving nutrition log:', error);
      toast.error('Failed to save nutrition log');
      return null;
    }
  };

  const deleteNutritionLog = async (id: string) => {
    if (!user) {
      const updatedLogs = nutritionLogs.filter(log => log.id !== id);
      setNutritionLogs(updatedLogs);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`nutritionLogs_${today}`, JSON.stringify(updatedLogs));
      return;
    }

    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting nutrition log:', error);
        toast.error('Failed to delete nutrition log');
        return;
      }

      setNutritionLogs(prev => prev.filter(log => log.id !== id));
    } catch (error) {
      console.error('Error deleting nutrition log:', error);
      toast.error('Failed to delete nutrition log');
    }
  };

  return {
    nutritionLogs,
    loading,
    loadNutritionLogs,
    saveNutritionLog,
    deleteNutritionLog
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDeletedMeals = () => {
  const { user } = useAuth();
  const [deletedMeals, setDeletedMeals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDeletedMeals = async () => {
    if (!user) {
      // For non-authenticated users, load from localStorage
      const savedDeleted = localStorage.getItem('deletedDefaultMeals');
      if (savedDeleted) {
        try {
          const parsedDeleted = JSON.parse(savedDeleted);
          setDeletedMeals(parsedDeleted);
        } catch (error) {
          console.error('Error parsing deleted meals:', error);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deleted_meals')
        .select('meal_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading deleted meals:', error);
        return;
      }

      if (data) {
        const mealIds = data.map(item => item.meal_id);
        setDeletedMeals(mealIds);
      }
    } catch (error) {
      console.error('Error loading deleted meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMealAsDeleted = async (mealId: string) => {
    if (!user) {
      // For non-authenticated users, save to localStorage
      const updatedDeleted = [...deletedMeals, mealId];
      setDeletedMeals(updatedDeleted);
      localStorage.setItem('deletedDefaultMeals', JSON.stringify(updatedDeleted));
      return;
    }

    try {
      const { error } = await supabase
        .from('deleted_meals')
        .insert({
          user_id: user.id,
          meal_id: mealId
        });

      if (error) {
        console.error('Error marking meal as deleted:', error);
        return;
      }

      setDeletedMeals(prev => [...prev, mealId]);
      
      // Also save to localStorage as backup
      const updatedDeleted = [...deletedMeals, mealId];
      localStorage.setItem('deletedDefaultMeals', JSON.stringify(updatedDeleted));
    } catch (error) {
      console.error('Error marking meal as deleted:', error);
    }
  };

  const restoreMeal = async (mealId: string) => {
    if (!user) {
      const updatedDeleted = deletedMeals.filter(id => id !== mealId);
      setDeletedMeals(updatedDeleted);
      localStorage.setItem('deletedDefaultMeals', JSON.stringify(updatedDeleted));
      return;
    }

    try {
      const { error } = await supabase
        .from('deleted_meals')
        .delete()
        .eq('user_id', user.id)
        .eq('meal_id', mealId);

      if (error) {
        console.error('Error restoring meal:', error);
        return;
      }

      const updatedDeleted = deletedMeals.filter(id => id !== mealId);
      setDeletedMeals(updatedDeleted);
      localStorage.setItem('deletedDefaultMeals', JSON.stringify(updatedDeleted));
    } catch (error) {
      console.error('Error restoring meal:', error);
    }
  };

  useEffect(() => {
    loadDeletedMeals();
  }, [user]);

  return {
    deletedMeals,
    loading,
    markMealAsDeleted,
    restoreMeal,
    loadDeletedMeals
  };
};

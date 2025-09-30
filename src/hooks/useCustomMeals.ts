
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CustomMeal {
  id: string;
  name: string;
  orderIndex: number;
}

export const useCustomMeals = () => {
  const { user } = useAuth();
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCustomMeals = async () => {
    if (!user) {
      // For non-authenticated users, load from localStorage
      const savedMeals = localStorage.getItem('customMeals');
      if (savedMeals) {
        try {
          const parsedMeals = JSON.parse(savedMeals);
          setCustomMeals(parsedMeals);
        } catch (error) {
          console.error('Error parsing custom meals:', error);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_meals')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error loading custom meals:', error);
        return;
      }

      if (data) {
        const formattedMeals = data.map(item => ({
          id: item.id,
          name: item.name,
          orderIndex: item.order_index || 0
        }));
        setCustomMeals(formattedMeals);
      }
    } catch (error) {
      console.error('Error loading custom meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomMeal = async (meal: Omit<CustomMeal, 'id'>) => {
    if (!user) {
      // For non-authenticated users, save to localStorage
      const newMeal = { ...meal, id: `custom-${Date.now()}` };
      const updatedMeals = [...customMeals, newMeal];
      setCustomMeals(updatedMeals);
      localStorage.setItem('customMeals', JSON.stringify(updatedMeals));
      return newMeal;
    }

    try {
      const { data, error } = await supabase
        .from('custom_meals')
        .insert({
          user_id: user.id,
          name: meal.name,
          order_index: meal.orderIndex
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding custom meal:', error);
        toast.error('Failed to add custom meal');
        return null;
      }

      const newMeal = {
        id: data.id,
        name: data.name,
        orderIndex: data.order_index || 0
      };

      setCustomMeals(prev => [...prev, newMeal]);
      return newMeal;
    } catch (error) {
      console.error('Error adding custom meal:', error);
      toast.error('Failed to add custom meal');
      return null;
    }
  };

  const deleteCustomMeal = async (id: string) => {
    if (!user) {
      const updatedMeals = customMeals.filter(meal => meal.id !== id);
      setCustomMeals(updatedMeals);
      localStorage.setItem('customMeals', JSON.stringify(updatedMeals));
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_meals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting custom meal:', error);
        toast.error('Failed to delete custom meal');
        return;
      }

      setCustomMeals(prev => prev.filter(meal => meal.id !== id));
    } catch (error) {
      console.error('Error deleting custom meal:', error);
      toast.error('Failed to delete custom meal');
    }
  };

  useEffect(() => {
    loadCustomMeals();

    // Set up real-time subscription for authenticated users
    if (!user) return;

    const channel = supabase
      .channel('custom-meals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_meals',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadCustomMeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    customMeals,
    loading,
    addCustomMeal,
    deleteCustomMeal,
    loadCustomMeals
  };
};

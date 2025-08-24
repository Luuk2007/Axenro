
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export const useCustomExercises = () => {
  const { user } = useAuth();
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCustomExercises = async () => {
    if (!user) {
      // For non-authenticated users, load from localStorage
      const savedExercises = localStorage.getItem('customExercises');
      if (savedExercises) {
        try {
          const parsedExercises = JSON.parse(savedExercises);
          setCustomExercises(parsedExercises);
        } catch (error) {
          console.error('Error parsing custom exercises:', error);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading custom exercises:', error);
        return;
      }

      if (data) {
        const formattedExercises = data.map(item => ({
          id: item.id,
          name: item.name,
          muscleGroup: item.muscle_group
        }));
        setCustomExercises(formattedExercises);
      }
    } catch (error) {
      console.error('Error loading custom exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomExercise = async (exercise: Omit<CustomExercise, 'id'>) => {
    if (!user) {
      // For non-authenticated users, save to localStorage
      const newExercise = { ...exercise, id: `custom-${Date.now()}` };
      const updatedExercises = [...customExercises, newExercise];
      setCustomExercises(updatedExercises);
      localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
      return newExercise;
    }

    try {
      const { data, error } = await supabase
        .from('custom_exercises')
        .insert({
          user_id: user.id,
          name: exercise.name,
          muscle_group: exercise.muscleGroup
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding custom exercise:', error);
        toast.error('Failed to add custom exercise');
        return null;
      }

      const newExercise = {
        id: data.id,
        name: data.name,
        muscleGroup: data.muscle_group
      };

      setCustomExercises(prev => [...prev, newExercise]);
      
      // Also save to localStorage as backup
      const updatedExercises = [...customExercises, newExercise];
      localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
      
      return newExercise;
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      toast.error('Failed to add custom exercise');
      return null;
    }
  };

  const deleteCustomExercise = async (id: string) => {
    if (!user) {
      const updatedExercises = customExercises.filter(ex => ex.id !== id);
      setCustomExercises(updatedExercises);
      localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_exercises')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting custom exercise:', error);
        toast.error('Failed to delete custom exercise');
        return;
      }

      const updatedExercises = customExercises.filter(ex => ex.id !== id);
      setCustomExercises(updatedExercises);
      localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
    } catch (error) {
      console.error('Error deleting custom exercise:', error);
      toast.error('Failed to delete custom exercise');
    }
  };

  useEffect(() => {
    loadCustomExercises();
  }, [user]);

  return {
    customExercises,
    loading,
    addCustomExercise,
    deleteCustomExercise,
    loadCustomExercises
  };
};

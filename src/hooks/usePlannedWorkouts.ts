import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlannedWorkout {
  id: string;
  name: string;
  date: string;
  muscle_groups?: string[];
  estimated_duration?: number;
  notes?: string;
  created_at?: string;
}

export const usePlannedWorkouts = () => {
  const queryClient = useQueryClient();

  // Fetch all planned workouts
  const { data: plannedWorkouts = [], isLoading } = useQuery({
    queryKey: ['planned-workouts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('planned_workouts')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      return data.map(workout => ({
        id: workout.id,
        name: workout.name,
        date: workout.date,
        muscle_groups: workout.muscle_groups || [],
        estimated_duration: workout.estimated_duration,
        notes: workout.notes,
        created_at: workout.created_at
      }));
    },
  });

  // Add new planned workout
  const addPlannedWorkout = useMutation({
    mutationFn: async (workout: Omit<PlannedWorkout, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('planned_workouts')
        .insert({
          user_id: user.id,
          name: workout.name,
          date: workout.date,
          muscle_groups: workout.muscle_groups || [],
          estimated_duration: workout.estimated_duration,
          notes: workout.notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-workouts'] });
      toast.success('Workout planned successfully');
    },
    onError: (error) => {
      console.error('Error adding planned workout:', error);
      toast.error('Failed to plan workout');
    },
  });

  // Delete planned workout
  const deletePlannedWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const { error } = await supabase
        .from('planned_workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-workouts'] });
      toast.success('Planned workout deleted');
    },
    onError: (error) => {
      console.error('Error deleting planned workout:', error);
      toast.error('Failed to delete planned workout');
    },
  });

  // Update planned workout
  const updatePlannedWorkout = useMutation({
    mutationFn: async ({ id, ...workout }: Partial<PlannedWorkout> & { id: string }) => {
      const { data, error } = await supabase
        .from('planned_workouts')
        .update({
          name: workout.name,
          date: workout.date,
          muscle_groups: workout.muscle_groups,
          estimated_duration: workout.estimated_duration,
          notes: workout.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-workouts'] });
      toast.success('Planned workout updated');
    },
    onError: (error) => {
      console.error('Error updating planned workout:', error);
      toast.error('Failed to update planned workout');
    },
  });

  return {
    plannedWorkouts,
    isLoading,
    addPlannedWorkout: addPlannedWorkout.mutate,
    deletePlannedWorkout: deletePlannedWorkout.mutate,
    updatePlannedWorkout: updatePlannedWorkout.mutate,
  };
};
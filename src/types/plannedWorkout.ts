
export type PlannedWorkout = {
  id: string;
  name: string;
  date: string; // Format: "yyyy-MM-dd"
  muscleGroups: string[];
  estimatedDuration?: number; // in minutes
  notes?: string;
};

// Helper functions for planned workouts
export const getPlannedWorkouts = (): PlannedWorkout[] => {
  const stored = localStorage.getItem('plannedWorkouts');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing planned workouts:', error);
    }
  }
  return [];
};

export const savePlannedWorkouts = (plannedWorkouts: PlannedWorkout[]) => {
  localStorage.setItem('plannedWorkouts', JSON.stringify(plannedWorkouts));
};

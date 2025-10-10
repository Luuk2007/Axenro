import { Workout, Exercise } from '@/types/workout';

export const isCardioExercise = (exercise: Exercise): boolean => {
  return exercise.muscleGroup === 'cardio';
};

export const isCardioWorkout = (workout: Workout): boolean => {
  return workout.exercises.some(exercise => isCardioExercise(exercise));
};

export const getWorkoutSummary = (workout: Workout) => {
  const hasCardio = isCardioWorkout(workout);
  const cardioExercises = workout.exercises.filter(isCardioExercise);
  const strengthExercises = workout.exercises.filter(exercise => !isCardioExercise(exercise));
  
  if (hasCardio && strengthExercises.length === 0) {
    // Pure cardio workout
    const totalDurationSeconds = cardioExercises.reduce((sum, ex) => 
      sum + (ex.sets[0]?.reps || 0), 0
    );
    return {
      type: 'cardio',
      exerciseCount: cardioExercises.length,
      duration: totalDurationSeconds,
      sets: null
    };
  } else if (!hasCardio) {
    // Pure strength workout
    const totalSets = strengthExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    return {
      type: 'strength',
      exerciseCount: strengthExercises.length,
      sets: totalSets,
      duration: null
    };
  } else {
    // Mixed workout
    const totalSets = strengthExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalDurationSeconds = cardioExercises.reduce((sum, ex) => 
      sum + (ex.sets[0]?.reps || 0), 0
    );
    return {
      type: 'mixed',
      exerciseCount: workout.exercises.length,
      sets: totalSets,
      duration: totalDurationSeconds
    };
  }
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (secs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${secs}s`;
};

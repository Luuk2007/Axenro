
export interface ExerciseSet {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
}

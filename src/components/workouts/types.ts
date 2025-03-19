
export type ExerciseSet = {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  sets: ExerciseSet[];
  muscleGroup?: string;
};

export type Workout = {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
};

export const muscleGroups = [
  "chest", "back", "shoulders", "arms", "legs", "core", "fullBody", "cardio"
];

export const defaultExercises = [
  { id: "bench-press", name: "Bench Press", muscleGroup: "chest" },
  { id: "squat", name: "Squat", muscleGroup: "legs" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "back" },
  { id: "shoulder-press", name: "Shoulder Press", muscleGroup: "shoulders" },
  { id: "bicep-curl", name: "Bicep Curl", muscleGroup: "arms" },
  { id: "tricep-extension", name: "Tricep Extension", muscleGroup: "arms" },
  { id: "pull-up", name: "Pull Up", muscleGroup: "back" },
  { id: "push-up", name: "Push Up", muscleGroup: "chest" },
  { id: "plank", name: "Plank", muscleGroup: "core" },
  { id: "running", name: "Running", muscleGroup: "cardio" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "back" },
  { id: "chest-fly", name: "Chest Fly", muscleGroup: "chest" },
  { id: "dumbbell-row", name: "Dumbbell Row", muscleGroup: "back" },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs" },
  { id: "calf-raise", name: "Calf Raise", muscleGroup: "legs" },
  { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "shoulders" },
  { id: "face-pull", name: "Face Pull", muscleGroup: "shoulders" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroup: "arms" },
  { id: "skull-crusher", name: "Skull Crusher", muscleGroup: "arms" },
  { id: "ab-crunch", name: "Ab Crunch", muscleGroup: "core" },
  { id: "russian-twist", name: "Russian Twist", muscleGroup: "core" },
  { id: "cycling", name: "Cycling", muscleGroup: "cardio" },
  { id: "jumping-jacks", name: "Jumping Jacks", muscleGroup: "cardio" },
  { id: "burpees", name: "Burpees", muscleGroup: "fullBody" },
  { id: "kettlebell-swing", name: "Kettlebell Swing", muscleGroup: "fullBody" }
];

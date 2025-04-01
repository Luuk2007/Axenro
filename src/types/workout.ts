
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

// Define muscle groups for exercise filtering
export const muscleGroups = [
  { label: "Chest", value: "chest" },
  { label: "Back", value: "back" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Arms", value: "arms" },
  { label: "Legs", value: "legs" },
  { label: "Core", value: "core" },
  { label: "Full Body", value: "fullBody" },
  { label: "Cardio", value: "cardio" }
];

// Define exercise database with IDs, names and muscle groups
export const allExercises = [
  // Chest exercises
  { id: "bench-press", name: "Bench Press", muscleGroup: "chest" },
  { id: "incline-press", name: "Incline Press", muscleGroup: "chest" },
  { id: "chest-fly", name: "Chest Fly", muscleGroup: "chest" },
  { id: "push-ups", name: "Push-ups", muscleGroup: "chest" },
  { id: "cable-crossover", name: "Cable Crossover", muscleGroup: "chest" },
  
  // Back exercises
  { id: "pull-ups", name: "Pull-ups", muscleGroup: "back" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "back" },
  { id: "bent-over-row", name: "Bent Over Row", muscleGroup: "back" },
  { id: "seated-row", name: "Seated Row", muscleGroup: "back" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "back" },
  
  // Shoulder exercises
  { id: "overhead-press", name: "Overhead Press", muscleGroup: "shoulders" },
  { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "shoulders" },
  { id: "front-raise", name: "Front Raise", muscleGroup: "shoulders" },
  { id: "face-pull", name: "Face Pull", muscleGroup: "shoulders" },
  { id: "shrugs", name: "Shrugs", muscleGroup: "shoulders" },
  
  // Arms exercises
  { id: "bicep-curl", name: "Bicep Curl", muscleGroup: "arms" },
  { id: "tricep-extension", name: "Tricep Extension", muscleGroup: "arms" },
  { id: "skull-crusher", name: "Skull Crusher", muscleGroup: "arms" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroup: "arms" },
  { id: "dips", name: "Dips", muscleGroup: "arms" },
  
  // Legs exercises
  { id: "squat", name: "Squat", muscleGroup: "legs" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs" },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs" },
  { id: "leg-curl", name: "Leg Curl", muscleGroup: "legs" },
  { id: "calf-raise", name: "Calf Raise", muscleGroup: "legs" },
  
  // Core exercises
  { id: "crunches", name: "Crunches", muscleGroup: "core" },
  { id: "plank", name: "Plank", muscleGroup: "core" },
  { id: "russian-twist", name: "Russian Twist", muscleGroup: "core" },
  { id: "leg-raise", name: "Leg Raise", muscleGroup: "core" },
  { id: "mountain-climber", name: "Mountain Climber", muscleGroup: "core" },
  
  // Full Body exercises
  { id: "burpee", name: "Burpee", muscleGroup: "fullBody" },
  { id: "thruster", name: "Thruster", muscleGroup: "fullBody" },
  { id: "clean-and-jerk", name: "Clean and Jerk", muscleGroup: "fullBody" },
  { id: "snatch", name: "Snatch", muscleGroup: "fullBody" },
  
  // Cardio exercises
  { id: "running", name: "Running", muscleGroup: "cardio" },
  { id: "cycling", name: "Cycling", muscleGroup: "cardio" },
  { id: "jump-rope", name: "Jump Rope", muscleGroup: "cardio" },
  { id: "elliptical", name: "Elliptical", muscleGroup: "cardio" },
  { id: "stair-climber", name: "Stair Climber", muscleGroup: "cardio" }
];

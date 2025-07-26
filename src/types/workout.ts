
export type ExerciseSet = {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
  isCardio?: boolean;
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

// Exercise database organized by muscle groups
export const exerciseDatabase = {
  chest: [
    { id: "bench-press", name: "Bench Press" },
    { id: "incline-bench-press", name: "Incline Bench Press" },
    { id: "decline-bench-press", name: "Decline Bench Press" },
    { id: "dumbbell-press", name: "Dumbbell Press" },
    { id: "cable-fly", name: "Cable Fly" },
    { id: "chest-dip", name: "Chest Dip" },
    { id: "push-up", name: "Push Up" },
    { id: "pec-deck-fly", name: "Pec Deck Fly" }
  ],
  back: [
    { id: "deadlift", name: "Deadlift" },
    { id: "pull-up", name: "Pull Up" },
    { id: "chin-up", name: "Chin Up" },
    { id: "bent-over-row", name: "Bent Over Row" },
    { id: "t-bar-row", name: "T-Bar Row" },
    { id: "seated-cable-row", name: "Seated Cable Row" },
    { id: "lat-pulldown", name: "Lat Pulldown" },
    { id: "single-arm-dumbbell-row", name: "Single-Arm Dumbbell Row" }
  ],
  shoulders: [
    { id: "overhead-press", name: "Overhead Press" },
    { id: "shoulder-press", name: "Shoulder Press" },
    { id: "lateral-raise", name: "Lateral Raise" },
    { id: "front-raise", name: "Front Raise" },
    { id: "reverse-fly", name: "Reverse Fly" },
    { id: "face-pull", name: "Face Pull" },
    { id: "upright-row", name: "Upright Row" },
    { id: "shrug", name: "Shrug" }
  ],
  arms: [
    { id: "bicep-curl", name: "Bicep Curl" },
    { id: "hammer-curl", name: "Hammer Curl" },
    { id: "preacher-curl", name: "Preacher Curl" },
    { id: "tricep-extension", name: "Tricep Extension" },
    { id: "tricep-pushdown", name: "Tricep Pushdown" },
    { id: "skull-crusher", name: "Skull Crusher" },
    { id: "overhead-tricep-extension", name: "Overhead Tricep Extension" },
    { id: "dip", name: "Dip" }
  ],
  legs: [
    { id: "squat", name: "Squat" },
    { id: "leg-press", name: "Leg Press" },
    { id: "lunge", name: "Lunge" },
    { id: "leg-extension", name: "Leg Extension" },
    { id: "leg-curl", name: "Leg Curl" },
    { id: "calf-raise", name: "Calf Raise" },
    { id: "romanian-deadlift", name: "Romanian Deadlift" },
    { id: "hack-squat", name: "Hack Squat" }
  ],
  core: [
    { id: "crunch", name: "Crunch" },
    { id: "plank", name: "Plank" },
    { id: "russian-twist", name: "Russian Twist" },
    { id: "leg-raise", name: "Leg Raise" },
    { id: "mountain-climber", name: "Mountain Climber" },
    { id: "sit-up", name: "Sit-Up" },
    { id: "hanging-knee-raise", name: "Hanging Knee Raise" },
    { id: "ab-wheel-rollout", name: "Ab Wheel Rollout" }
  ],
  cardio: [
    { id: "running", name: "Running" },
    { id: "cycling", name: "Cycling" },
    { id: "rowing", name: "Rowing" },
    { id: "stair-climbing", name: "Stair Climbing" },
    { id: "elliptical", name: "Elliptical" },
    { id: "jump-rope", name: "Jump Rope" },
    { id: "swimming", name: "Swimming" },
    { id: "battle-ropes", name: "Battle Ropes" }
  ]
};

// Function to get all exercises including custom ones
export const getAllExercises = () => {
  // Get default exercises
  const defaultExercises = Object.entries(exerciseDatabase).flatMap(
    ([group, exercises]) => exercises.map(ex => ({ ...ex, muscleGroup: group }))
  );

  // Get custom exercises from localStorage
  const customExercisesData = localStorage.getItem('customExercises');
  let customExercises = [];
  
  if (customExercisesData) {
    try {
      const parsed = JSON.parse(customExercisesData);
      customExercises = parsed.map((exercise: any, index: number) => ({
        id: exercise.id || `custom-${Date.now()}-${index}`,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup
      }));
    } catch (error) {
      console.error('Error parsing custom exercises:', error);
    }
  }

  return [...defaultExercises, ...customExercises];
};

// Flatten the exercise database for easier selection (backward compatibility)
export const allExercises = getAllExercises();

export const muscleGroups = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" }
];

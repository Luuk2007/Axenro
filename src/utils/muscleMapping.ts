// Maps exercise IDs and names to specific heatmap muscle groups
// Heatmap groups: chest, shoulders, biceps, abs, quads, back, triceps, glutes, hamstrings, calves

const exerciseToMuscle: Record<string, string> = {
  // Chest
  'bench-press': 'chest',
  'incline-bench-press': 'chest',
  'decline-bench-press': 'chest',
  'dumbbell-press': 'chest',
  'cable-fly': 'chest',
  'chest-dip': 'chest',
  'pec-deck-fly': 'chest',

  // Back
  'deadlift': 'back',
  'pull-up': 'back',
  'chin-up': 'back',
  'bent-over-row': 'back',
  't-bar-row': 'back',
  'seated-cable-row': 'back',
  'lat-pulldown': 'back',
  'single-arm-dumbbell-row': 'back',
  'pull-ups-calisthenics': 'back',
  'chin-ups-calisthenics': 'back',
  'front-lever': 'back',
  'back-lever': 'back',

  // Shoulders
  'overhead-press': 'shoulders',
  'shoulder-press': 'shoulders',
  'lateral-raise': 'shoulders',
  'front-raise': 'shoulders',
  'reverse-fly': 'shoulders',
  'face-pull': 'shoulders',
  'upright-row': 'shoulders',
  'shrug': 'shoulders',
  'handstand-push-ups': 'shoulders',

  // Biceps
  'bicep-curl': 'biceps',
  'hammer-curl': 'biceps',
  'preacher-curl': 'biceps',

  // Triceps
  'tricep-extension': 'triceps',
  'tricep-pushdown': 'triceps',
  'skull-crusher': 'triceps',
  'overhead-tricep-extension': 'triceps',
  'dip': 'triceps',
  'dips-calisthenics': 'triceps',

  // Abs / Core
  'crunch': 'abs',
  'plank': 'abs',
  'russian-twist': 'abs',
  'leg-raise': 'abs',
  'mountain-climber': 'abs',
  'sit-up': 'abs',
  'hanging-knee-raise': 'abs',
  'ab-wheel-rollout': 'abs',
  'l-sit': 'abs',
  'dragon-flag': 'abs',

  // Quads
  'squat': 'quads',
  'leg-press': 'quads',
  'lunge': 'quads',
  'leg-extension': 'quads',
  'hack-squat': 'quads',
  'pistol-squats': 'quads',

  // Hamstrings
  'leg-curl': 'hamstrings',
  'romanian-deadlift': 'hamstrings',

  // Glutes
  'push-up': 'chest', // override: push-up is chest
  'push-ups': 'chest',
  'muscle-ups': 'back',
  'planche': 'shoulders',

  // Calves
  'calf-raise': 'calves',
};

// Fallback: map muscle group categories from exerciseDatabase to heatmap groups
const muscleGroupToHeatmap: Record<string, string> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  arms: 'biceps', // generic arms → biceps as default
  legs: 'quads',  // generic legs → quads as default
  core: 'abs',
  cardio: '',     // cardio doesn't map to a specific muscle
  calisthenics: 'back',
};

// Name-based fallback matching (case-insensitive)
const namePatterns: [RegExp, string][] = [
  [/bench|chest|pec|fly/i, 'chest'],
  [/shoulder|lateral raise|front raise|overhead press|military press|arnold/i, 'shoulders'],
  [/bicep|curl|hammer curl|preacher/i, 'biceps'],
  [/tricep|pushdown|skull crush|dip/i, 'triceps'],
  [/squat|leg press|lunge|leg extension|quad/i, 'quads'],
  [/hamstring|leg curl|romanian|rdl/i, 'hamstrings'],
  [/calf|calves/i, 'calves'],
  [/glute|hip thrust|glut/i, 'glutes'],
  [/pull.?up|row|lat pull|deadlift|back/i, 'back'],
  [/crunch|plank|ab|core|sit.?up/i, 'abs'],
  [/shrug/i, 'shoulders'],
];

export function getHeatmapMuscle(exerciseId: string, exerciseName: string, muscleGroup?: string): string {
  // 1. Direct ID mapping
  if (exerciseToMuscle[exerciseId]) return exerciseToMuscle[exerciseId];

  // 2. Name pattern matching
  for (const [pattern, muscle] of namePatterns) {
    if (pattern.test(exerciseName)) return muscle;
  }

  // 3. Muscle group category fallback
  if (muscleGroup && muscleGroupToHeatmap[muscleGroup]) {
    return muscleGroupToHeatmap[muscleGroup];
  }

  return '';
}

export const heatmapMuscleGroups = [
  'chest', 'shoulders', 'biceps', 'abs', 'quads',
  'back', 'triceps', 'glutes', 'hamstrings', 'calves',
] as const;

export type HeatmapMuscle = typeof heatmapMuscleGroups[number];

export const frontMuscles: HeatmapMuscle[] = ['chest', 'shoulders', 'biceps', 'abs', 'quads'];
export const backMuscles: HeatmapMuscle[] = ['back', 'triceps', 'glutes', 'hamstrings', 'calves'];

export const muscleLabels: Record<HeatmapMuscle, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  abs: 'Abs',
  quads: 'Quads',
  back: 'Back',
  triceps: 'Triceps',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
};

export const recommendedSets: Record<HeatmapMuscle, [number, number]> = {
  chest: [10, 20],
  shoulders: [10, 20],
  biceps: [8, 16],
  abs: [6, 14],
  quads: [10, 20],
  back: [10, 20],
  triceps: [8, 16],
  glutes: [8, 16],
  hamstrings: [8, 16],
  calves: [6, 14],
};

export const recommendedExercises: Record<HeatmapMuscle, string[]> = {
  chest: ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Push-Ups'],
  shoulders: ['Overhead Press', 'Lateral Raise', 'Rear Delt Fly', 'Arnold Press', 'Face Pull'],
  biceps: ['Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Incline Curl'],
  abs: ['Plank', 'Cable Crunch', 'Hanging Leg Raise', 'Ab Wheel Rollout'],
  quads: ['Squat', 'Leg Press', 'Lunge', 'Leg Extension', 'Bulgarian Split Squat'],
  back: ['Deadlift', 'Pull-Up', 'Bent Over Row', 'Lat Pulldown', 'Seated Cable Row'],
  triceps: ['Tricep Pushdown', 'Skull Crusher', 'Overhead Extension', 'Dips'],
  glutes: ['Hip Thrust', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Glute Bridge'],
  hamstrings: ['Romanian Deadlift', 'Leg Curl', 'Good Morning', 'Nordic Curl'],
  calves: ['Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise'],
};

export function getVolumeColor(sets: number): string {
  if (sets === 0) return 'var(--muscle-grey)';
  if (sets <= 3) return 'var(--muscle-red)';
  if (sets <= 8) return 'var(--muscle-yellow)';
  return 'var(--muscle-green)';
}

export function getVolumeLevel(sets: number): 'none' | 'undertrained' | 'moderate' | 'trained' {
  if (sets === 0) return 'none';
  if (sets <= 3) return 'undertrained';
  if (sets <= 8) return 'moderate';
  return 'trained';
}

import { Exercise, getAllExercises, muscleGroups } from "@/types/workout";

export type WorkoutExerciseLike = Pick<Exercise, "name" | "muscleGroup"> & {
  name?: string;
  muscleGroup?: string | null;
};

const GROUP_LABELS = new Map<string, string>([
  ...muscleGroups.map((g) => [g.value, g.label] as const),
  ["cardio", "Cardio"],
]);

const GROUP_ORDER: string[] = [...muscleGroups.map((g) => g.value), "cardio"];

const GROUP_SYNONYMS: Record<string, string> = {
  // common typos / singulars
  shoulder: "shoulders",
  arm: "arms",
  leg: "legs",

  // common split groups
  bicep: "arms",
  biceps: "arms",
  tricep: "arms",
  triceps: "arms",
};

export const normalizeMuscleGroup = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const raw = value.toLowerCase().trim();
  const normalized = GROUP_SYNONYMS[raw] ?? raw;

  if (GROUP_LABELS.has(normalized)) return normalized;
  return null;
};

export const findMuscleGroupByExerciseName = (exerciseName: string): string | null => {
  const normalizedName = exerciseName.toLowerCase().trim();
  if (!normalizedName) return null;

  // getAllExercises already includes default + custom exercises (localStorage)
  const allExercises = getAllExercises();
  const match = allExercises.find((ex) => ex.name.toLowerCase().trim() === normalizedName);
  return normalizeMuscleGroup(match?.muscleGroup);
};

export const getWorkoutMuscleGroupsFromExercises = (exercises: WorkoutExerciseLike[]): string[] => {
  const groups = new Set<string>();

  for (const exercise of exercises ?? []) {
    const direct = normalizeMuscleGroup(exercise?.muscleGroup);
    const derived = direct ?? (exercise?.name ? findMuscleGroupByExerciseName(exercise.name) : null);

    if (derived) groups.add(derived);
  }

  return Array.from(groups).sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a);
    const bi = GROUP_ORDER.indexOf(b);

    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
};

export const getWorkoutTitleFromExercises = (exercises: WorkoutExerciseLike[]): string => {
  if (!exercises || exercises.length === 0) return "";

  const groups = getWorkoutMuscleGroupsFromExercises(exercises);
  if (groups.length === 0) return "Workout";

  return groups
    .map((g) => GROUP_LABELS.get(g) ?? g.charAt(0).toUpperCase() + g.slice(1))
    .join("/");
};

// Centralized macro calculation utilities
// This ensures consistency across all pages (Profile, Nutrition, Dashboard)
// Uses evidence-based formulas: Mifflin-St Jeor for BMR, protein capped at realistic g/kg limits

export interface MacroRatios {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ProfileData {
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  exerciseFrequency?: string;
  fitnessGoal?: string;
}

// Activity multipliers (Harris-Benedict revision)
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job
};

// Exercise frequency to activity level mapping
const EXERCISE_FREQ_TO_ACTIVITY: Record<string, string> = {
  '0-1': 'sedentary',
  '0-2': 'light',
  '2-3': 'light',
  '3-5': 'moderate',
  '4-5': 'active',
  '6+': 'very_active',
};

// Protein recommendations per kg bodyweight based on preset type
// Evidence-based ranges:
// - Sedentary adults: 0.8-1.0 g/kg
// - Active adults: 1.2-1.6 g/kg  
// - Athletes/muscle building: 1.6-2.2 g/kg
// - Maximum beneficial: ~2.2-2.5 g/kg (no additional benefit above this)
const PROTEIN_PER_KG_BY_PRESET: Record<string, number> = {
  cutting: 2.0,        // High protein during fat loss to preserve muscle
  bulking: 1.8,        // Moderate-high for muscle building
  recomposition: 2.2,  // Maximum for recomp (build muscle + lose fat)
  keto: 1.6,           // Moderate protein for keto
  endurance: 1.4,      // Lower protein for endurance athletes
  balanced: 1.6,       // Standard active person
};

// Maximum protein per kg (evidence shows no benefit above this)
const MAX_PROTEIN_PER_KG = 2.5;
const ABSOLUTE_MAX_PROTEIN = 220; // Absolute cap in grams

// Calorie adjustment for goals
const CALORIE_ADJUSTMENTS: Record<string, number> = {
  lose: -500,     // 500 kcal deficit for ~0.5kg/week loss
  maintain: 0,
  gain: 300,      // 300 kcal surplus for lean muscle gain
};

// Get default macro ratios based on fitness goal (only used when no preset selected)
export const getDefaultRatios = (fitnessGoal: string = "maintain"): MacroRatios => {
  switch (fitnessGoal) {
    case "gain":
      return { protein: 25, carbs: 50, fat: 25 };
    case "lose":
      return { protein: 35, carbs: 35, fat: 30 };
    case "maintain":
      return { protein: 30, carbs: 40, fat: 30 };
    default:
      return { protein: 30, carbs: 40, fat: 30 };
  }
};

// Get selected preset ID from localStorage
export const getSelectedPreset = (): string | null => {
  try {
    return localStorage.getItem('selectedMacroPreset');
  } catch (error) {
    return null;
  }
};

// Get macro ratios (custom if available, otherwise default)
export const getMacroRatios = (fitnessGoal: string = "maintain"): MacroRatios => {
  try {
    const savedRatios = localStorage.getItem('customMacroRatios');
    if (savedRatios) {
      const customRatios = JSON.parse(savedRatios);
      // Validate that ratios are valid numbers and add up to 100
      if (
        typeof customRatios.protein === 'number' &&
        typeof customRatios.carbs === 'number' &&
        typeof customRatios.fat === 'number' &&
        Math.abs((customRatios.protein + customRatios.carbs + customRatios.fat) - 100) < 1
      ) {
        return customRatios;
      }
    }
  } catch (error) {
    console.error('Error loading custom macro ratios:', error);
  }
  
  return getDefaultRatios(fitnessGoal);
};

// Calculate BMR using Mifflin-St Jeor formula (most accurate for modern populations)
export const calculateBMR = (data: ProfileData): number => {
  const { weight, height, age, gender } = data;
  
  if (!weight || !height || !age || !gender) {
    return 0;
  }
  
  // Mifflin-St Jeor Formula:
  // Male: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5
  // Female: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161
  
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // For "other" gender, use average of male and female
    bmr = 10 * weight + 6.25 * height - 5 * age - 78;
  }
  
  return Math.round(bmr);
};

// Get activity multiplier from activity level or exercise frequency
const getActivityMultiplier = (data: ProfileData): number => {
  const { activityLevel, exerciseFrequency } = data;
  
  // Prioritize activityLevel if available
  if (activityLevel && ACTIVITY_MULTIPLIERS[activityLevel]) {
    return ACTIVITY_MULTIPLIERS[activityLevel];
  }
  
  // Fall back to exercise frequency
  if (exerciseFrequency) {
    const mappedActivity = EXERCISE_FREQ_TO_ACTIVITY[exerciseFrequency];
    if (mappedActivity && ACTIVITY_MULTIPLIERS[mappedActivity]) {
      return ACTIVITY_MULTIPLIERS[mappedActivity];
    }
  }
  
  // Default to moderate activity
  return ACTIVITY_MULTIPLIERS.moderate;
};

// Calculate TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (data: ProfileData): number => {
  const bmr = calculateBMR(data);
  
  if (bmr === 0) {
    return 0;
  }
  
  const activityMultiplier = getActivityMultiplier(data);
  return Math.round(bmr * activityMultiplier);
};

// Calculate daily calorie needs based on TDEE and goal
export const calculateDailyCalories = (data: ProfileData): number => {
  const tdee = calculateTDEE(data);
  
  if (tdee === 0) {
    return 2000; // Reasonable default fallback
  }
  
  const fitnessGoal = data?.fitnessGoal || "maintain";
  const adjustment = CALORIE_ADJUSTMENTS[fitnessGoal] || 0;
  
  // Apply calorie adjustment based on goal
  let calories = tdee + adjustment;
  
  // Ensure minimum calorie intake for health
  const minCalories = data?.gender === 'female' ? 1200 : 1500;
  calories = Math.max(calories, minCalories);
  
  return Math.round(calories);
};

// Calculate protein based on bodyweight with realistic limits
// This is the KEY function that prevents unrealistic protein values
export const calculateProteinForPreset = (weight: number, presetId: string | null): number => {
  if (!weight || weight <= 0) {
    return 100; // Reasonable default
  }
  
  // Get protein per kg based on preset, default to balanced
  const proteinPerKg = presetId && PROTEIN_PER_KG_BY_PRESET[presetId] 
    ? PROTEIN_PER_KG_BY_PRESET[presetId] 
    : 1.6;
  
  // Calculate base protein
  let protein = Math.round(weight * proteinPerKg);
  
  // Apply caps to ensure realistic values
  const maxByWeight = Math.round(weight * MAX_PROTEIN_PER_KG);
  protein = Math.min(protein, maxByWeight, ABSOLUTE_MAX_PROTEIN);
  
  // Minimum protein threshold
  protein = Math.max(protein, 50);
  
  return protein;
};

// Calculate macro breakdown based on calorie needs with REALISTIC protein limits
// This is the main calculation function used throughout the app
export const calculateMacrosWithProteinLimit = (
  calories: number, 
  weight: number,
  presetId: string | null,
  ratios: MacroRatios
): Omit<MacroGoals, 'calories'> => {
  // Step 1: Calculate protein based on bodyweight (NOT percentage of calories)
  const protein = calculateProteinForPreset(weight, presetId);
  const proteinCalories = protein * 4;
  
  // Step 2: Calculate remaining calories for carbs and fat
  const remainingCalories = calories - proteinCalories;
  
  // Step 3: Distribute remaining calories between carbs and fat based on ratio proportions
  // We use the carb:fat ratio from the preset, but protein is fixed by bodyweight
  const carbFatTotal = ratios.carbs + ratios.fat;
  const carbProportion = carbFatTotal > 0 ? ratios.carbs / carbFatTotal : 0.5;
  const fatProportion = carbFatTotal > 0 ? ratios.fat / carbFatTotal : 0.5;
  
  const carbCalories = Math.round(remainingCalories * carbProportion);
  const fatCalories = Math.round(remainingCalories * fatProportion);
  
  const carbs = Math.round(carbCalories / 4);  // 4 cal per gram
  const fat = Math.round(fatCalories / 9);     // 9 cal per gram
  
  // Ensure minimum values
  return { 
    protein, 
    carbs: Math.max(carbs, 20),  // Minimum 20g carbs
    fat: Math.max(fat, 20)       // Minimum 20g fat
  };
};

// Legacy function for backward compatibility (uses new calculation internally)
export const calculateMacros = (calories: number, data: ProfileData): Omit<MacroGoals, 'calories'> => {
  const presetId = getSelectedPreset();
  const ratios = getMacroRatios(data.fitnessGoal || 'maintain');
  const weight = data.weight || 70;
  
  return calculateMacrosWithProteinLimit(calories, weight, presetId, ratios);
};

// Calculate complete macro goals (calories + macros)
export const calculateMacroGoals = (profileData: ProfileData): MacroGoals => {
  const calories = calculateDailyCalories(profileData);
  const macros = calculateMacros(calories, profileData);
  
  return {
    calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
  };
};

// Get the actual protein ratio percentage (for display purposes)
export const getActualProteinPercentage = (protein: number, calories: number): number => {
  if (calories <= 0) return 0;
  return Math.round((protein * 4 / calories) * 100);
};

// Get detailed calculation breakdown for display
export const getCalculationBreakdown = (profileData: ProfileData) => {
  const bmr = calculateBMR(profileData);
  const tdee = calculateTDEE(profileData);
  const calories = calculateDailyCalories(profileData);
  const activityMultiplier = getActivityMultiplier(profileData);
  const fitnessGoal = profileData.fitnessGoal || 'maintain';
  const calorieAdjustment = CALORIE_ADJUSTMENTS[fitnessGoal] || 0;
  const presetId = getSelectedPreset();
  const proteinPerKg = presetId && PROTEIN_PER_KG_BY_PRESET[presetId] 
    ? PROTEIN_PER_KG_BY_PRESET[presetId] 
    : 1.6;
  
  return {
    bmr,
    tdee,
    calories,
    activityMultiplier,
    calorieAdjustment,
    proteinPerKg,
    weight: profileData.weight || 0,
  };
};

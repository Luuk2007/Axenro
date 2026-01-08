// Centralized macro calculation utilities
// This ensures consistency across all pages (Profile, Nutrition, Dashboard)
// Uses evidence-based formulas: Mifflin-St Jeor for BMR, protein based on g/kg bodyweight

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

// Protein recommendations per kg bodyweight (evidence-based)
const PROTEIN_PER_KG: Record<string, number> = {
  lose: 2.0,      // Higher protein during fat loss to preserve muscle (1.8-2.2g/kg)
  maintain: 1.6,  // Standard recommendation for active individuals (1.4-1.8g/kg)
  gain: 1.8,      // Muscle building requires moderate-high protein (1.6-2.0g/kg)
};

// Calorie adjustment for goals
const CALORIE_ADJUSTMENTS: Record<string, number> = {
  lose: -500,     // 500 kcal deficit for ~0.5kg/week loss
  maintain: 0,
  gain: 300,      // 300 kcal surplus for lean muscle gain
};

// Get default macro ratios based on fitness goal
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

// Calculate protein based on bodyweight (evidence-based approach)
export const calculateProtein = (data: ProfileData): number => {
  const { weight, fitnessGoal } = data;
  
  if (!weight) {
    return 100; // Reasonable default
  }
  
  const goal = fitnessGoal || 'maintain';
  const proteinPerKg = PROTEIN_PER_KG[goal] || PROTEIN_PER_KG.maintain;
  
  // Calculate protein based on bodyweight
  let protein = Math.round(weight * proteinPerKg);
  
  // Cap protein at reasonable maximum (2.5g/kg or 200g for very heavy individuals)
  const maxProtein = Math.min(Math.round(weight * 2.5), 220);
  protein = Math.min(protein, maxProtein);
  
  return protein;
};

// Calculate macro breakdown based on calorie needs and selected ratios
export const calculateMacros = (calories: number, data: ProfileData): Omit<MacroGoals, 'calories'> => {
  const fitnessGoal = data.fitnessGoal || 'maintain';
  const ratios = getMacroRatios(fitnessGoal);
  
  // Calculate all macros based on the selected ratio percentages
  // This ensures presets work correctly and all macros change together
  const protein = Math.round((calories * (ratios.protein / 100)) / 4); // 4 cal per gram
  const carbs = Math.round((calories * (ratios.carbs / 100)) / 4);     // 4 cal per gram
  const fat = Math.round((calories * (ratios.fat / 100)) / 9);         // 9 cal per gram
  
  return { protein, carbs, fat };
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

// Get detailed calculation breakdown for display
export const getCalculationBreakdown = (profileData: ProfileData) => {
  const bmr = calculateBMR(profileData);
  const tdee = calculateTDEE(profileData);
  const calories = calculateDailyCalories(profileData);
  const activityMultiplier = getActivityMultiplier(profileData);
  const fitnessGoal = profileData.fitnessGoal || 'maintain';
  const calorieAdjustment = CALORIE_ADJUSTMENTS[fitnessGoal] || 0;
  const proteinPerKg = PROTEIN_PER_KG[fitnessGoal] || PROTEIN_PER_KG.maintain;
  
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

// Centralized macro calculation utilities
// This ensures consistency across all pages (Profile, Nutrition, Dashboard)

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

// Get default macro ratios based on fitness goal
export const getDefaultRatios = (fitnessGoal: string = "maintain"): MacroRatios => {
  switch (fitnessGoal) {
    case "gain":
      return { protein: 30, carbs: 45, fat: 25 };
    case "lose":
      return { protein: 40, carbs: 30, fat: 30 };
    case "maintain":
      return { protein: 35, carbs: 35, fat: 30 };
    default:
      return { protein: 35, carbs: 35, fat: 30 };
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

// Calculate BMR using Mifflin-St Jeor formula
export const calculateBMR = (data: ProfileData): number => {
  const { weight, height, age, gender } = data;
  
  if (!weight || !height || !age || !gender) {
    return 0;
  }
  
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === "female") {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // For "other" gender, use an average of male and female formulas
    return 10 * weight + 6.25 * height - 5 * age - 78;
  }
};

// Calculate daily calorie needs based on activity level and goal
export const calculateDailyCalories = (data: ProfileData): number => {
  const bmr = calculateBMR(data);
  
  console.log('calculateDailyCalories: Input data:', data);
  console.log('calculateDailyCalories: Calculated BMR:', bmr);
  
  if (bmr === 0) {
    return 2200; // Default fallback
  }
  
  // Apply activity multiplier - prioritize activityLevel over exerciseFrequency
  let activityMultiplier = 1.2; // Sedentary default
  const activityLevel = data?.activityLevel;
  const exerciseFreq = data?.exerciseFrequency || "0-1";
  
  console.log('calculateDailyCalories: Activity level:', activityLevel);
  console.log('calculateDailyCalories: Exercise frequency:', exerciseFreq);
  
  if (activityLevel) {
    // Use activityLevel if available (newer, more accurate)
    switch (activityLevel) {
      case "sedentary":
        activityMultiplier = 1.2;
        break;
      case "light":
        activityMultiplier = 1.375;
        break;
      case "moderate":
        activityMultiplier = 1.55;
        break;
      case "active":
        activityMultiplier = 1.725;
        break;
      case "very_active":
        activityMultiplier = 1.9;
        break;
    }
  } else {
    // Fall back to exerciseFrequency for backwards compatibility
    switch (exerciseFreq) {
      case "0-1":
      case "0-2":
        activityMultiplier = 1.375; // Light activity
        break;
      case "2-3":
      case "3-5":
        activityMultiplier = 1.55; // Moderate activity
        break;
      case "4-5":
        activityMultiplier = 1.65; // Active
        break;
      case "6+":
        activityMultiplier = 1.725; // Very active
        break;
    }
  }
  
  console.log('calculateDailyCalories: Activity multiplier:', activityMultiplier);
  
  let calories = Math.round(bmr * activityMultiplier);
  
  console.log('calculateDailyCalories: Calories before goal adjustment:', calories);
  
  // Adjust based on fitness goal
  const fitnessGoal = data?.fitnessGoal || "maintain";
  
  switch (fitnessGoal) {
    case "gain":
      calories += 500;
      break;
    case "lose":
      calories -= 500;
      break;
    case "maintain":
      // No adjustment needed
      break;
  }
  
  console.log('calculateDailyCalories: Final calories:', calories);
  
  return calories;
};

// Calculate macro breakdown based on calorie needs and ratios
export const calculateMacros = (calories: number, fitnessGoal: string = "maintain"): Omit<MacroGoals, 'calories'> => {
  const ratios = getMacroRatios(fitnessGoal);
  
  const protein = Math.round((calories * (ratios.protein / 100)) / 4); // 4 calories per gram of protein
  const fat = Math.round((calories * (ratios.fat / 100)) / 9); // 9 calories per gram of fat
  const carbs = Math.round((calories * (ratios.carbs / 100)) / 4); // 4 calories per gram of carbs
  
  return { protein, fat, carbs };
};

// Calculate complete macro goals (calories + macros)
export const calculateMacroGoals = (profileData: ProfileData): MacroGoals => {
  const calories = calculateDailyCalories(profileData);
  const macros = calculateMacros(calories, profileData.fitnessGoal);
  
  return {
    calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
  };
};
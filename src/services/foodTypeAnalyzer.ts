
export type FoodCategory = 'liquid' | 'solid' | 'countable' | 'powder';

export interface FoodAnalysis {
  category: FoodCategory;
  appropriateUnits: string[];
  defaultUnit: string;
  defaultAmount: number;
}

// Unit conversion factors to grams/ml (base units)
export const UNIT_CONVERSIONS: Record<string, number> = {
  // Weight units (to grams)
  gram: 1,
  kilogram: 1000,
  ounce: 28.35,
  pound: 453.59,
  
  // Volume units (to ml)
  milliliter: 1,
  liter: 1000,
  cup: 240,
  tablespoon: 15,
  teaspoon: 5,
  
  // Count units (these will be handled differently)
  piece: 1,
  slice: 1,
};

// Available units by category
const CATEGORY_UNITS: Record<FoodCategory, string[]> = {
  liquid: ['milliliter', 'cup', 'tablespoon', 'teaspoon'],
  solid: ['gram', 'ounce'],
  countable: ['piece', 'slice', 'gram'],
  powder: ['gram', 'cup', 'tablespoon', 'teaspoon']
};

// Keywords to identify food categories
const LIQUID_KEYWORDS = [
  'drink', 'juice', 'water', 'milk', 'coffee', 'tea', 'soda', 'beer', 'wine',
  'oil', 'vinegar', 'sauce', 'soup', 'broth', 'smoothie', 'shake'
];

const COUNTABLE_KEYWORDS = [
  'egg', 'apple', 'banana', 'orange', 'slice', 'piece', 'cookie', 'cracker',
  'biscuit', 'tablet', 'capsule', 'pill'
];

const POWDER_KEYWORDS = [
  'flour', 'sugar', 'salt', 'pepper', 'spice', 'powder', 'cocoa', 'protein',
  'supplement', 'seasoning'
];

/**
 * Analyze food product to determine appropriate units and category
 */
export const analyzeFoodType = (productName: string, categories: string[] = [], servingSize?: string): FoodAnalysis => {
  const name = productName.toLowerCase();
  const categoryText = categories.join(' ').toLowerCase();
  const serving = servingSize?.toLowerCase() || '';
  
  // Check for liquid indicators
  if (LIQUID_KEYWORDS.some(keyword => 
    name.includes(keyword) || categoryText.includes(keyword) || serving.includes('ml') || serving.includes('liter')
  )) {
    return {
      category: 'liquid',
      appropriateUnits: CATEGORY_UNITS.liquid,
      defaultUnit: 'milliliter',
      defaultAmount: extractDefaultAmount(servingSize, 250)
    };
  }
  
  // Check for countable items
  if (COUNTABLE_KEYWORDS.some(keyword => 
    name.includes(keyword) || categoryText.includes(keyword) || serving.includes('piece') || serving.includes('slice')
  )) {
    return {
      category: 'countable',
      appropriateUnits: CATEGORY_UNITS.countable,
      defaultUnit: 'piece',
      defaultAmount: 1
    };
  }
  
  // Check for powder/granular items
  if (POWDER_KEYWORDS.some(keyword => 
    name.includes(keyword) || categoryText.includes(keyword)
  )) {
    return {
      category: 'powder',
      appropriateUnits: CATEGORY_UNITS.powder,
      defaultUnit: 'gram',
      defaultAmount: extractDefaultAmount(servingSize, 30)
    };
  }
  
  // Default to solid food
  return {
    category: 'solid',
    appropriateUnits: CATEGORY_UNITS.solid,
    defaultUnit: 'gram',
    defaultAmount: extractDefaultAmount(servingSize, 100)
  };
};

/**
 * Extract numeric amount from serving size string
 */
const extractDefaultAmount = (servingSize?: string, fallback: number = 100): number => {
  if (!servingSize) return fallback;
  
  const match = servingSize.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const amount = parseFloat(match[1]);
    return amount > 0 ? amount : fallback;
  }
  
  return fallback;
};

/**
 * Calculate nutrition values based on unit conversion
 */
export const calculateNutritionForUnit = (
  baseNutrition: { calories: number; protein: number; carbs: number; fat: number },
  amount: number,
  unit: string,
  servings: number = 1,
  isLiquid: boolean = false
): { calories: number; protein: number; carbs: number; fat: number } => {
  let multiplier = 1;
  
  // For countable items, multiply by servings directly
  if (unit === 'piece' || unit === 'slice') {
    multiplier = servings;
  } else {
    // For weight/volume units, calculate based on amount and servings
    const conversionFactor = UNIT_CONVERSIONS[unit] || 1;
    const baseUnit = isLiquid ? 100 : 100; // per 100ml or 100g
    multiplier = (amount * conversionFactor * servings) / baseUnit;
  }
  
  return {
    calories: baseNutrition.calories * multiplier,
    protein: baseNutrition.protein * multiplier,
    carbs: baseNutrition.carbs * multiplier,
    fat: baseNutrition.fat * multiplier
  };
};

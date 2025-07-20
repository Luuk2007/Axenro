
export interface FoodLogEntry {
  id?: string;
  user_id: string;
  meal_id: string;
  date: string;
  food_item: FoodItem;
  created_at?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  brand?: string;
  servingSize?: string;
  imageUrl?: string | null;
  logId?: string; // Added for storing the database log ID for deletion
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealData {
  id: string; // Changed from MealType to string to support custom meals
  name: string;
  items: FoodItem[];
}

// Helper function to get all available meals
export const getAvailableMeals = (): MealData[] => {
  const defaultMeals: MealData[] = [
    { id: 'breakfast', name: 'Breakfast', items: [] },
    { id: 'lunch', name: 'Lunch', items: [] },
    { id: 'dinner', name: 'Dinner', items: [] },
    { id: 'snack', name: 'Snack', items: [] },
  ];

  // Load custom meals from localStorage
  const customMealsData = localStorage.getItem('customMeals');
  if (customMealsData) {
    try {
      const customMeals = JSON.parse(customMealsData);
      const customMealData = customMeals.map((meal: any) => ({
        id: meal.id,
        name: meal.name,
        items: [],
      }));
      return [...defaultMeals, ...customMealData];
    } catch (error) {
      console.error('Error parsing custom meals:', error);
    }
  }

  return defaultMeals;
};

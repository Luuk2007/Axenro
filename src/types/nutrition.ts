
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

  // Check for deleted meals
  const deletedMealsData = localStorage.getItem('deletedMeals');
  let deletedMealIds = [];
  if (deletedMealsData) {
    try {
      deletedMealIds = JSON.parse(deletedMealsData);
    } catch (error) {
      console.error('Error parsing deleted meals:', error);
    }
  }

  // Filter out deleted default meals
  const availableDefaultMeals = defaultMeals.filter(meal => !deletedMealIds.includes(meal.id));

  // Load custom meal names for default meals
  const mealNamesData = localStorage.getItem('mealNames');
  if (mealNamesData) {
    try {
      const mealNames = JSON.parse(mealNamesData);
      availableDefaultMeals.forEach(meal => {
        if (mealNames[meal.id]) {
          meal.name = mealNames[meal.id];
        }
      });
    } catch (error) {
      console.error('Error parsing meal names:', error);
    }
  }

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
      return [...availableDefaultMeals, ...customMealData];
    } catch (error) {
      console.error('Error parsing custom meals:', error);
    }
  }

  return availableDefaultMeals;
};


export interface FoodLogEntry {
  id?: string;
  user_id: string;
  meal_id: string;
  date: string;
  food_item: FoodItem;
  created_at?: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
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
  nutrition?: NutritionData; // Add nutrition property for compatibility
  quantity?: number; // Add quantity for scaling
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealData {
  id: string; // Changed from MealType to string to support custom meals
  name: string;
  items: FoodItem[];
  order?: number;
}

// Helper function to get all available meals
export const getAvailableMeals = (): MealData[] => {
  const defaultMeals: MealData[] = [
    { id: 'breakfast', name: 'Breakfast', items: [], order: 0 },
    { id: 'lunch', name: 'Lunch', items: [], order: 1 },
    { id: 'dinner', name: 'Dinner', items: [], order: 2 },
    { id: 'snack', name: 'Snack', items: [], order: 3 },
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

  // Load meal orders
  const mealOrdersData = localStorage.getItem('mealOrders');
  let mealOrders = {};
  if (mealOrdersData) {
    try {
      mealOrders = JSON.parse(mealOrdersData);
    } catch (error) {
      console.error('Error parsing meal orders:', error);
    }
  }

  // Apply custom orders to default meals
  availableDefaultMeals.forEach(meal => {
    if (mealOrders[meal.id] !== undefined) {
      meal.order = mealOrders[meal.id];
    }
  });

  // Load custom meals from localStorage
  const customMealsData = localStorage.getItem('customMeals');
  if (customMealsData) {
    try {
      const customMeals = JSON.parse(customMealsData);
      const customMealData = customMeals.map((meal: any) => ({
        id: meal.id,
        name: meal.name,
        items: [],
        order: mealOrders[meal.id] !== undefined ? mealOrders[meal.id] : 1000
      }));
      
      const allMeals = [...availableDefaultMeals, ...customMealData];
      // Sort by order
      allMeals.sort((a, b) => (a.order || 0) - (b.order || 0));
      return allMeals;
    } catch (error) {
      console.error('Error parsing custom meals:', error);
    }
  }

  // Sort default meals by order
  availableDefaultMeals.sort((a, b) => (a.order || 0) - (b.order || 0));
  return availableDefaultMeals;
};

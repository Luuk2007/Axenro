
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
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealData {
  id: MealType;
  name: string;
  items: FoodItem[];
}

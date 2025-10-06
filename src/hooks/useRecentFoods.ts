import { useState, useEffect } from 'react';

export interface RecentFood {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  amount: number;
  unit: string;
  servings: number;
  lastUsed: number;
}

const MAX_RECENT_FOODS = 8;
const STORAGE_KEY = 'recentFoods';

export const useRecentFoods = () => {
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);

  useEffect(() => {
    loadRecentFoods();
  }, []);

  const loadRecentFoods = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const foods = JSON.parse(stored);
        setRecentFoods(foods);
      }
    } catch (error) {
      console.error('Error loading recent foods:', error);
    }
  };

  const addRecentFood = (foodItem: Omit<RecentFood, 'lastUsed'>) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let foods: RecentFood[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists (by name and brand)
      foods = foods.filter(f => !(f.name === foodItem.name && f.brand === foodItem.brand));

      // Add to beginning with timestamp
      foods.unshift({
        ...foodItem,
        lastUsed: Date.now()
      });

      // Keep only MAX_RECENT_FOODS
      foods = foods.slice(0, MAX_RECENT_FOODS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
      setRecentFoods(foods);
    } catch (error) {
      console.error('Error saving recent food:', error);
    }
  };

  return {
    recentFoods,
    addRecentFood
  };
};


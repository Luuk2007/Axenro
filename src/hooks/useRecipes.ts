import { useState, useEffect } from 'react';

export interface RecipeIngredient {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  unit: string;
  servings: number;
  imageUrl?: string | null;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  servings: number;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'userRecipes';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecipes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const saveRecipes = (updated: Recipe[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecipes(updated);
  };

  const calculateTotals = (ingredients: RecipeIngredient[]) => ({
    totalCalories: Math.round(ingredients.reduce((sum, i) => sum + i.calories, 0)),
    totalProtein: Math.round(ingredients.reduce((sum, i) => sum + i.protein, 0) * 10) / 10,
    totalCarbs: Math.round(ingredients.reduce((sum, i) => sum + i.carbs, 0) * 10) / 10,
    totalFat: Math.round(ingredients.reduce((sum, i) => sum + i.fat, 0) * 10) / 10,
  });

  const addRecipe = (name: string, ingredients: RecipeIngredient[], servings: number = 1) => {
    const totals = calculateTotals(ingredients);
    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name,
      ingredients,
      ...totals,
      servings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveRecipes([recipe, ...recipes]);
    return recipe;
  };

  const updateRecipe = (id: string, name: string, ingredients: RecipeIngredient[], servings: number = 1) => {
    const totals = calculateTotals(ingredients);
    const updated = recipes.map(r =>
      r.id === id ? { ...r, name, ingredients, ...totals, servings, updatedAt: Date.now() } : r
    );
    saveRecipes(updated);
  };

  const deleteRecipe = (id: string) => {
    saveRecipes(recipes.filter(r => r.id !== id));
  };

  return { recipes, addRecipe, updateRecipe, deleteRecipe };
};

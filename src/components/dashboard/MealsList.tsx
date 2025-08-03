import React, { useState, useEffect } from 'react';
import { Plus, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAvailableMeals, MealData, FoodItem } from '@/types/nutrition';
import { getFoodLogs } from '@/services/openFoodFactsService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MealItemData {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
}

interface MealsListProps {
  title: string;
  className?: string;
  onViewAll?: () => void;
}

export default function MealsList({ title, className, onViewAll }: MealsListProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<MealItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadTodaysMeals = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        let mealData: MealData[] = [];

        if (isAuthenticated) {
          // Load from Supabase
          const logs = await getFoodLogs(today);
          const availableMeals = getAvailableMeals();
          
          mealData = availableMeals.map(meal => ({
            ...meal,
            items: []
          }));

          // Add food items to appropriate meals
          logs.forEach((log: any) => {
            const mealIndex = mealData.findIndex(meal => meal.id === log.meal_id);
            if (mealIndex >= 0) {
              mealData[mealIndex].items.push(log.food_item);
            }
          });
        } else {
          // Load from localStorage
          const availableMeals = getAvailableMeals();
          mealData = availableMeals.map(meal => ({
            ...meal,
            items: []
          }));

          const savedData = localStorage.getItem(`foodLog_${today}`);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              parsedData.forEach((item: any) => {
                if (item.mealId) {
                  const mealIndex = mealData.findIndex(meal => meal.id === item.mealId);
                  if (mealIndex >= 0) {
                    mealData[mealIndex].items.push(item);
                  }
                }
              });
            } catch (error) {
              console.error('Error parsing local food data:', error);
            }
          }
        }

        // Convert to MealItemData format
        const mealItems: MealItemData[] = mealData
          .filter(meal => meal.items.length > 0)
          .slice(0, 3) // Show only first 3 meals
          .map(meal => {
            const totalCalories = meal.items.reduce((sum: number, item: FoodItem) => sum + item.calories, 0);
            const totalProtein = meal.items.reduce((sum: number, item: FoodItem) => sum + item.protein, 0);
            
            return {
              id: meal.id,
              name: meal.name,
              time: getTimeForMeal(meal.id),
              calories: Math.round(totalCalories),
              protein: Math.round(totalProtein * 10) / 10
            };
          });

        setMeals(mealItems);
      } catch (error) {
        console.error('Error loading today\'s meals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodaysMeals();

    // Listen for meal changes
    const handleMealsChanged = () => {
      loadTodaysMeals();
    };

    window.addEventListener('mealsChanged', handleMealsChanged);
    
    return () => {
      window.removeEventListener('mealsChanged', handleMealsChanged);
    };
  }, [isAuthenticated]);

  const getTimeForMeal = (mealId: string): string => {
    const timeMap: { [key: string]: string } = {
      'breakfast': '08:00',
      'lunch': '12:30',
      'dinner': '18:30',
      'snack': '15:00'
    };
    return timeMap[mealId] || '12:00';
  };
  
  if (isLoading) {
    return (
      <div className={cn("glassy-card rounded-xl card-shadow hover-scale h-full flex flex-col", className)}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-medium tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("glassy-card rounded-xl card-shadow hover-scale h-full flex flex-col", className)}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium tracking-tight">{title}</h3>
        <div className="flex items-center gap-2">
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/nutrition')}>
              {t("viewAll")}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {meals.length > 0 ? (
            meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Utensils className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">{meal.time}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-medium">{meal.calories} cal</p>
                  <p className="text-xs text-muted-foreground">{meal.protein}g {t("protein")}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="rounded-full bg-secondary p-3 mb-3">
                <Utensils className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h4 className="text-sm font-medium mb-1">{t("noMealsTracked")}</h4>
              <p className="text-xs text-muted-foreground mb-4">
                {t("startTracking")}
              </p>
              <Button size="sm" onClick={() => {
                navigate('/nutrition');
                // Trigger the add food dialog after a short delay
                setTimeout(() => {
                  const addFoodBtn = document.querySelector('[data-testid="add-food-trigger"]');
                  if (addFoodBtn) {
                    (addFoodBtn as HTMLElement).click();
                  }
                }, 100);
              }}>{t("addMeal")}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

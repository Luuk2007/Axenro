import React, { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAvailableMeals, MealData, FoodItem } from '@/types/nutrition';
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
  selectedDate?: Date;
  foodLogs?: any[];
}

export default function MealsList({ 
  title, 
  className, 
  onViewAll, 
  selectedDate = new Date(),
  foodLogs = []
}: MealsListProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<MealItemData[]>([]);

  useEffect(() => {
    // Convert foodLogs to meal items
    const availableMeals = getAvailableMeals();
    const mealData: MealData[] = availableMeals.map(meal => ({
      ...meal,
      items: []
    }));

    // Add food items to appropriate meals
    foodLogs.forEach((log: any) => {
      const mealIndex = mealData.findIndex(meal => meal.id === log.meal_id);
      if (mealIndex >= 0) {
        mealData[mealIndex].items.push(log.food_item);
      }
    });

    // Convert to individual food items
    const mealItems: MealItemData[] = [];
    
    mealData
      .filter(meal => meal.items.length > 0)
      .forEach(meal => {
        meal.items.forEach((item: FoodItem, index: number) => {
          mealItems.push({
            id: `${meal.id}-${index}`,
            name: item.name,
            time: '',
            calories: Math.round(item.calories),
            protein: Math.round(item.protein * 10) / 10
          });
        });
      });
      
    // Show only first 5 individual items
    const displayItems = mealItems.slice(0, 5);
    setMeals(displayItems);
  }, [foodLogs]);

  
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
              <h4 className="text-sm font-medium mb-1">{t("No meals tracked")}</h4>
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
              }}>{t("Add meal")}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

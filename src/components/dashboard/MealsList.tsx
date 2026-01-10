import React, { useState, useEffect } from 'react';
import { Utensils, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
      <CardHeader className="pb-0 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-2">
              <Utensils className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold">{title}</h3>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/nutrition')}>
              {t("viewAll")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-4">
        {meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <Card 
                key={meal.id}
                className="overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-orange-500/10 p-2">
                        <Utensils className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="font-medium text-sm">{meal.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{meal.calories} cal</p>
                      <p className="text-xs text-muted-foreground">{meal.protein}g {t("protein")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
            <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-4 mb-4">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">{t("No meals tracked")}</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              {t("startTracking")}
            </p>
            <Button 
              onClick={() => {
                navigate('/nutrition');
                // Trigger the add food dialog after a short delay
                setTimeout(() => {
                  const addFoodBtn = document.querySelector('[data-testid="add-food-trigger"]');
                  if (addFoodBtn) {
                    (addFoodBtn as HTMLElement).click();
                  }
                }, 100);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("Add meal")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

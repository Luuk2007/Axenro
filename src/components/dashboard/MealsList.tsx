import React, { useState, useEffect } from 'react';
import { Utensils, Plus, ChevronRight } from 'lucide-react';
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
    const availableMeals = getAvailableMeals();
    const mealData: MealData[] = availableMeals.map(meal => ({
      ...meal,
      items: []
    }));

    foodLogs.forEach((log: any) => {
      const mealIndex = mealData.findIndex(meal => meal.id === log.meal_id);
      if (mealIndex >= 0) {
        mealData[mealIndex].items.push(log.food_item);
      }
    });

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
      
    const displayItems = mealItems.slice(0, 5);
    setMeals(displayItems);
  }, [foodLogs]);

  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-card h-full flex flex-col overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 shadow-lg">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/nutrition')} className="rounded-lg">
              {t("viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pt-4">
        {meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal, index) => (
              <div 
                key={meal.id}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/5 to-amber-500/5 p-4 transition-all duration-300 hover:from-orange-500/10 hover:to-amber-500/10 cursor-pointer border border-border/50"
                onClick={() => navigate('/nutrition')}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 p-2">
                      <Utensils className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="font-medium text-sm truncate">{meal.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{meal.calories} cal</p>
                    <p className="text-xs text-muted-foreground">{meal.protein}g {t("protein")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 mb-4 shadow-lg">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">{t("No meals tracked")}</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              {t("startTracking")}
            </p>
            <Button 
              onClick={() => {
                navigate('/nutrition');
                setTimeout(() => {
                  const addFoodBtn = document.querySelector('[data-testid="add-food-trigger"]');
                  if (addFoodBtn) {
                    (addFoodBtn as HTMLElement).click();
                  }
                }, 100);
              }}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("Add meal")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
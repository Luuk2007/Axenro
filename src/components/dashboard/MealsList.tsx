
import React from 'react';
import { Plus, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
}

interface MealsListProps {
  meals: Meal[];
  title: string;
  className?: string;
}

export default function MealsList({ meals, title, className }: MealsListProps) {
  return (
    <div className={cn("glassy-card rounded-xl card-shadow hover-scale", className)}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium tracking-tight">{title}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add meal</span>
        </Button>
      </div>
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
                <p className="text-xs text-muted-foreground">{meal.protein}g protein</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="rounded-full bg-secondary p-3 mb-3">
              <Utensils className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h4 className="text-sm font-medium mb-1">No meals tracked yet</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Start tracking your nutrition by adding a meal.
            </p>
            <Button size="sm">Add Meal</Button>
          </div>
        )}
      </div>
    </div>
  );
}

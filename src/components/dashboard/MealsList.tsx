
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from 'react-router-dom';

interface MealItem {
  id: string;
  name: string;
  calories: number;
  time: string;
  meal: string;
}

interface MealsListProps {
  meals: MealItem[];
}

export default function MealsList({ meals }: MealsListProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleAddMeal = () => {
    navigate('/nutrition');
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t("todaysMeals")}</CardTitle>
        <Button size="sm" onClick={handleAddMeal} className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">{t("noMealsTracked")}</p>
            <Button size="sm" onClick={handleAddMeal}>
              {t("addMeal")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <p className="font-medium text-sm">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.meal} • {meal.time}</p>
                </div>
                <span className="text-sm font-medium">{meal.calories} {t("kcal")}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getAvailableMeals } from '@/types/nutrition';

interface CustomMeal {
  id: string;
  name: string;
  isDefault?: boolean;
  order?: number;
}

const MealsSettings = () => {
  const { t } = useLanguage();
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>(() => {
    const saved = localStorage.getItem('customMeals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((meal, index) => {
            if (typeof meal === 'string') {
              return { id: `custom-${index}`, name: meal };
            }
            return meal;
          });
        }
      } catch (error) {
        console.error('Error parsing custom meals:', error);
      }
    }
    return [];
  });
  const [newMealName, setNewMealName] = useState('');
  const [mealsOpen, setMealsOpen] = useState(false);

  // Check if there are deleted default meals
  const hasDeletedDefaultMeals = () => {
    const deletedMealsData = localStorage.getItem('deletedMeals');
    if (deletedMealsData) {
      try {
        const deletedMealIds = JSON.parse(deletedMealsData);
        return deletedMealIds.length > 0;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  // Get all meals including default ones
  const allMeals = getAvailableMeals();

  const addCustomMeal = () => {
    if (!newMealName.trim()) {
      toast.error(t("Please enter a meal name"));
      return;
    }

    const newMeal: CustomMeal = {
      id: `custom-${Date.now()}`,
      name: newMealName.trim()
    };

    const updatedMeals = [...customMeals, newMeal];
    setCustomMeals(updatedMeals);
    localStorage.setItem('customMeals', JSON.stringify(updatedMeals));
    setNewMealName('');
    toast.success(t("Meal added successfully"));
  };

  const removeCustomMeal = (index: number) => {
    const updatedMeals = customMeals.filter((_, i) => i !== index);
    setCustomMeals(updatedMeals);
    localStorage.setItem('customMeals', JSON.stringify(updatedMeals));
    toast.success(t("Meal removed successfully"));
  };

  const removeDefaultMeal = (mealId: string) => {
    // Get current deleted meals list
    const deletedMealsData = localStorage.getItem('deletedMeals');
    let deletedMealIds = [];
    
    if (deletedMealsData) {
      try {
        deletedMealIds = JSON.parse(deletedMealsData);
      } catch (error) {
        console.error('Error parsing deleted meals:', error);
      }
    }
    
    // Add this meal to deleted list
    deletedMealIds.push(mealId);
    localStorage.setItem('deletedMeals', JSON.stringify(deletedMealIds));
    
    // Trigger meals change event
    window.dispatchEvent(new Event('mealsChanged'));
    toast.success(t("Meal removed successfully"));
  };

  const restoreDefaultMeals = () => {
    // Clear the deleted meals list
    localStorage.removeItem('deletedMeals');
    
    // Trigger meals change event
    window.dispatchEvent(new Event('mealsChanged'));
    toast.success(t("Default meals restored successfully"));
  };

  return (
    <Card>
      <Collapsible open={mealsOpen} onOpenChange={setMealsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("meals")}</CardTitle>
              {mealsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 py-3">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t("Available meals")}</h3>
              <div className="space-y-2">
                {allMeals.map((meal, index) => (
                  <div key={meal.id || index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{meal.name}</span>
                      {!customMeals.find(cm => cm.id === meal.id) && (
                        <span className="text-xs text-muted-foreground">(Default)</span>
                      )}
                    </div>
                    {customMeals.find(cm => cm.id === meal.id) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomMeal(customMeals.findIndex(cm => cm.id === meal.id))}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDefaultMeal(meal.id)}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {hasDeletedDefaultMeals() && (
              <div className="pt-2">
                <Button
                  onClick={restoreDefaultMeals}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                >
                  <RotateCcw className="h-3 w-3 mr-2" />
                  {t("Restore to default")}
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t("Add custom meal")}</h3>
              <div className="flex gap-2">
                <Input
                  placeholder={t("Enter meal name")}
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomMeal()}
                  className="text-sm h-9"
                />
                <Button onClick={addCustomMeal} size="sm" className="h-9">
                  {t("Add")}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MealsSettings;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
        // Handle both old format (array of strings) and new format (array of objects)
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

  return (
    <Card>
      <Collapsible open={mealsOpen} onOpenChange={setMealsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("meals")}</CardTitle>
              {mealsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">{t("Available meals")}</h3>
              <div className="space-y-2">
                {customMeals.map((meal, index) => (
                  <div key={meal.id || index} className="flex items-center justify-between p-2 border rounded">
                    <span>{meal.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomMeal(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {customMeals.length === 0 && (
                  <p className="text-muted-foreground text-sm">No custom meals added yet</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">{t("Add custom meal")}</h3>
              <div className="flex gap-2">
                <Input
                  placeholder={t("Enter meal name")}
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomMeal()}
                />
                <Button onClick={addCustomMeal}>
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

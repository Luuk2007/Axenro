import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp, RotateCcw, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getAvailableMeals } from '@/types/nutrition';
import { useSubscription } from "@/hooks/useSubscription";
import { getSubscriptionLimits, formatUsageText, canAddMore } from "@/utils/subscriptionLimits";

interface CustomMeal {
  id: string;
  name: string;
  isDefault?: boolean;
  order?: number;
}

const MealsSettings = () => {
  const { t } = useLanguage();
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, loading } = useSubscription();
  
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
  const [availableMeals, setAvailableMeals] = useState(() => getAvailableMeals());

  // Get subscription limits
  const limits = getSubscriptionLimits(subscribed, subscription_tier, test_mode, test_subscription_tier);
  const customMealsCount = customMeals.length;
  const canAddMoreMeals = canAddMore(customMealsCount, limits.customMeals);
  const usageText = formatUsageText(customMealsCount, limits.customMeals);

  // Listen for meals changes and refresh available meals
  useEffect(() => {
    const handleMealsChanged = () => {
      setAvailableMeals(getAvailableMeals());
    };

    window.addEventListener('mealsChanged', handleMealsChanged);
    
    return () => {
      window.removeEventListener('mealsChanged', handleMealsChanged);
    };
  }, []);

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

  const addCustomMeal = () => {
    if (!newMealName.trim()) {
      toast.error(t("Please enter a meal name"));
      return;
    }

    // Check subscription limit
    if (!canAddMoreMeals) {
      toast.error(t("You've reached your custom meals limit. Upgrade to add more."));
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
    
    // Refresh available meals
    setAvailableMeals(getAvailableMeals());
  };

  const removeCustomMeal = (index: number) => {
    const updatedMeals = customMeals.filter((_, i) => i !== index);
    setCustomMeals(updatedMeals);
    localStorage.setItem('customMeals', JSON.stringify(updatedMeals));
    toast.success(t("Meal removed successfully"));
    
    // Refresh available meals
    setAvailableMeals(getAvailableMeals());
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
    
    // Immediately update available meals
    setAvailableMeals(getAvailableMeals());
    
    // Trigger meals change event
    window.dispatchEvent(new Event('mealsChanged'));
    toast.success(t("Meal removed successfully"));
  };

  const restoreDefaultMeals = () => {
    // Clear the deleted meals list
    localStorage.removeItem('deletedMeals');
    
    // Immediately update available meals
    setAvailableMeals(getAvailableMeals());
    
    // Trigger meals change event
    window.dispatchEvent(new Event('mealsChanged'));
    toast.success(t("Default meals restored successfully"));
  };

  const showUpgradePrompt = !canAddMoreMeals && limits.customMeals !== -1;

  return (
    <Card>
      <Collapsible open={mealsOpen} onOpenChange={setMealsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{t("Meals")}</CardTitle>
                <span className="text-sm text-muted-foreground">{usageText}</span>
              </div>
              {mealsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 py-3">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t("Available meals")}</h3>
              <div className="space-y-2">
                {availableMeals.map((meal, index) => (
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
              
              {showUpgradePrompt && (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("Upgrade to add more custom meals")}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    {limits.customMeals === 2 
                      ? t("Pro plan: 5 custom meals, Premium: unlimited")
                      : t("Premium plan: unlimited custom meals")
                    }
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder={t("Enter meal name")}
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && canAddMoreMeals && addCustomMeal()}
                  className="text-sm h-9"
                  disabled={!canAddMoreMeals}
                />
                <Button 
                  onClick={addCustomMeal} 
                  size="sm" 
                  className="h-9"
                  disabled={!canAddMoreMeals || loading}
                >
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

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
import { useCustomMeals } from "@/hooks/useCustomMeals";
import { useDeletedMeals } from "@/hooks/useDeletedMeals";

const MealsSettings = () => {
  const { t } = useLanguage();
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, loading: subscriptionLoading } = useSubscription();
  const { customMeals, loading: customMealsLoading, addCustomMeal: addCustomMealHook, deleteCustomMeal } = useCustomMeals();
  const { deletedMeals, loading: deletedMealsLoading, markMealAsDeleted, restoreMeal } = useDeletedMeals();
  
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

  // Refresh available meals when custom meals or deleted meals change
  useEffect(() => {
    setAvailableMeals(getAvailableMeals());
  }, [customMeals, deletedMeals]);

  const handleAddCustomMeal = async () => {
    if (!newMealName.trim()) {
      toast.error(t("Please enter a meal name"));
      return;
    }

    // Check subscription limit
    if (!canAddMoreMeals) {
      toast.error(t("You've reached your custom meals limit. Upgrade to add more."));
      return;
    }

    const result = await addCustomMealHook({
      name: newMealName.trim(),
      orderIndex: customMeals.length
    });

    if (result) {
      setNewMealName('');
      toast.success(t("Meal added successfully"));
      window.dispatchEvent(new Event('mealsChanged'));
    }
  };

  const handleRemoveCustomMeal = async (mealId: string) => {
    await deleteCustomMeal(mealId);
    toast.success(t("Meal removed successfully"));
    window.dispatchEvent(new Event('mealsChanged'));
  };

  const handleRemoveDefaultMeal = async (mealId: string) => {
    await markMealAsDeleted(mealId);
    window.dispatchEvent(new Event('mealsChanged'));
    toast.success(t("Meal removed successfully"));
  };

  const handleRestoreDefaultMeals = async () => {
    // Restore all deleted meals
    for (const mealId of deletedMeals) {
      await restoreMeal(mealId);
    }
    window.dispatchEvent(new Event('mealsChanged'));
    toast.success(t("Default meals restored successfully"));
  };

  const showUpgradePrompt = !canAddMoreMeals && limits.customMeals !== -1;
  const loading = subscriptionLoading || customMealsLoading || deletedMealsLoading;

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
                        onClick={() => handleRemoveCustomMeal(meal.id)}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDefaultMeal(meal.id)}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {deletedMeals.length > 0 && (
              <div className="pt-2">
                <Button
                  onClick={handleRestoreDefaultMeals}
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
                  onKeyPress={(e) => e.key === 'Enter' && canAddMoreMeals && handleAddCustomMeal()}
                  className="text-sm h-9"
                  disabled={!canAddMoreMeals}
                />
                <Button 
                  onClick={handleAddCustomMeal} 
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

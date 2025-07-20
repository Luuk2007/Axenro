
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface CustomMeal {
  id: string;
  name: string;
  isDefault: boolean;
}

const MealsSettings = () => {
  const { t } = useLanguage();
  const [meals, setMeals] = useState<CustomMeal[]>([]);
  const [newMealName, setNewMealName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Default meals
  const defaultMeals: CustomMeal[] = [
    { id: 'breakfast', name: t('breakfast'), isDefault: true },
    { id: 'lunch', name: t('lunch'), isDefault: true },
    { id: 'dinner', name: t('dinner'), isDefault: true },
    { id: 'snack', name: t('snack'), isDefault: true },
  ];

  useEffect(() => {
    // Load custom meals from localStorage
    const savedMeals = localStorage.getItem('customMeals');
    if (savedMeals) {
      const customMeals = JSON.parse(savedMeals);
      setMeals([...defaultMeals, ...customMeals]);
    } else {
      setMeals(defaultMeals);
    }
  }, []);

  const saveCustomMeals = (updatedMeals: CustomMeal[]) => {
    const customMeals = updatedMeals.filter(meal => !meal.isDefault);
    localStorage.setItem('customMeals', JSON.stringify(customMeals));
    setMeals(updatedMeals);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('mealsChanged'));
  };

  const addMeal = () => {
    if (!newMealName.trim()) {
      toast.error(t('Please enter a meal name'));
      return;
    }

    const newMeal: CustomMeal = {
      id: `custom-${Date.now()}`,
      name: newMealName.trim(),
      isDefault: false,
    };

    const updatedMeals = [...meals, newMeal];
    saveCustomMeals(updatedMeals);
    setNewMealName('');
    toast.success(t('Meal added successfully'));
  };

  const removeMeal = (mealId: string) => {
    const updatedMeals = meals.filter(meal => meal.id !== mealId);
    saveCustomMeals(updatedMeals);
    toast.success(t('Meal removed successfully'));
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle>{t('meals')}</CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Available meals')}</Label>
              <div className="space-y-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-sm">{meal.name}</span>
                    {!meal.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMeal(meal.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newMeal">{t('Add custom meal')}</Label>
              <div className="flex gap-2">
                <Input
                  id="newMeal"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder={t('Enter meal name')}
                  onKeyPress={(e) => e.key === 'Enter' && addMeal()}
                />
                <Button onClick={addMeal} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('Add')}
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

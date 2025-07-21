
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ChevronDown, ChevronUp, Edit2, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface CustomMeal {
  id: string;
  name: string;
  isDefault: boolean;
  deleted?: boolean;
  order?: number;
}

const MealsSettings = () => {
  const { t } = useLanguage();
  const [meals, setMeals] = useState<CustomMeal[]>([]);
  const [newMealName, setNewMealName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Default meals with order
  const defaultMeals: CustomMeal[] = [
    { id: 'breakfast', name: t('Breakfast'), isDefault: true, order: 0 },
    { id: 'lunch', name: t('Lunch'), isDefault: true, order: 1 },
    { id: 'dinner', name: t('Dinner'), isDefault: true, order: 2 },
    { id: 'snack', name: t('Snack'), isDefault: true, order: 3 },
  ];

  useEffect(() => {
    // Load custom meals from localStorage
    const savedMeals = localStorage.getItem('customMeals');
    const savedMealNames = localStorage.getItem('mealNames');
    const deletedMeals = localStorage.getItem('deletedMeals');
    const mealOrders = localStorage.getItem('mealOrders');
    
    let customMeals = [];
    let mealNames = {};
    let deletedMealIds = [];
    let orders = {};
    
    if (savedMeals) {
      customMeals = JSON.parse(savedMeals);
    }
    
    if (savedMealNames) {
      mealNames = JSON.parse(savedMealNames);
    }
    
    if (deletedMeals) {
      deletedMealIds = JSON.parse(deletedMeals);
    }

    if (mealOrders) {
      orders = JSON.parse(mealOrders);
    }
    
    // Apply custom names to default meals and mark deleted ones
    const updatedDefaultMeals = defaultMeals.map(meal => ({
      ...meal,
      name: mealNames[meal.id] || meal.name,
      deleted: deletedMealIds.includes(meal.id),
      order: orders[meal.id] !== undefined ? orders[meal.id] : meal.order
    }));
    
    // Add order to custom meals
    const customMealsWithOrder = customMeals.map((meal: any) => ({
      ...meal,
      order: orders[meal.id] !== undefined ? orders[meal.id] : 1000 // Default high order for custom meals
    }));
    
    const allMeals = [...updatedDefaultMeals, ...customMealsWithOrder];
    // Sort by order
    allMeals.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    setMeals(allMeals);
  }, []);

  const saveCustomMeals = (updatedMeals: CustomMeal[]) => {
    const customMeals = updatedMeals.filter(meal => !meal.isDefault);
    const mealNames = {};
    const deletedMealIds = [];
    const mealOrders = {};
    
    // Save custom names for default meals and track deleted ones
    updatedMeals.forEach((meal, index) => {
      // Save order for all meals
      mealOrders[meal.id] = index;
      
      if (meal.isDefault) {
        const originalName = defaultMeals.find(dm => dm.id === meal.id)?.name;
        if (originalName !== meal.name) {
          mealNames[meal.id] = meal.name;
        }
        if (meal.deleted) {
          deletedMealIds.push(meal.id);
        }
      }
    });
    
    localStorage.setItem('customMeals', JSON.stringify(customMeals));
    localStorage.setItem('mealNames', JSON.stringify(mealNames));
    localStorage.setItem('deletedMeals', JSON.stringify(deletedMealIds));
    localStorage.setItem('mealOrders', JSON.stringify(mealOrders));
    setMeals(updatedMeals);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('mealsChanged'));
  };

  const handleDragStart = (e: React.DragEvent, mealId: string) => {
    setDraggedItem(mealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetMealId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetMealId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = meals.findIndex(meal => meal.id === draggedItem);
    const targetIndex = meals.findIndex(meal => meal.id === targetMealId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newMeals = [...meals];
    const [draggedMeal] = newMeals.splice(draggedIndex, 1);
    newMeals.splice(targetIndex, 0, draggedMeal);
    
    // Update orders
    const updatedMeals = newMeals.map((meal, index) => ({
      ...meal,
      order: index
    }));
    
    saveCustomMeals(updatedMeals);
    setDraggedItem(null);
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
      order: meals.length
    };

    const updatedMeals = [...meals, newMeal];
    saveCustomMeals(updatedMeals);
    setNewMealName('');
    toast.success(t('Meal added successfully'));
  };

  const removeMeal = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    
    if (meal?.isDefault) {
      // For default meals, mark as deleted
      const updatedMeals = meals.map(m => 
        m.id === mealId ? { ...m, deleted: true } : m
      );
      saveCustomMeals(updatedMeals);
    } else {
      // For custom meals, remove completely
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      saveCustomMeals(updatedMeals);
    }
    
    toast.success(t('Meal removed successfully'));
  };

  const startEditing = (meal: CustomMeal) => {
    setEditingMeal(meal.id);
    setEditingName(meal.name);
  };

  const saveEdit = (mealId: string) => {
    if (!editingName.trim()) {
      toast.error(t('Please enter a meal name'));
      return;
    }

    const updatedMeals = meals.map(meal => 
      meal.id === mealId ? { ...meal, name: editingName.trim() } : meal
    );
    
    saveCustomMeals(updatedMeals);
    setEditingMeal(null);
    setEditingName('');
    toast.success(t('Meal updated successfully'));
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setEditingName('');
  };

  // Filter out deleted meals for display
  const displayMeals = meals.filter(meal => !meal.deleted);

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
                {displayMeals.map((meal) => (
                  <div 
                    key={meal.id} 
                    className={`flex items-center justify-between p-2 bg-secondary/30 rounded cursor-move ${
                      draggedItem === meal.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, meal.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, meal.id)}
                  >
                    {editingMeal === meal.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit(meal.id)}
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit(meal.id)}
                          className="h-8"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{meal.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(meal)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMeal(meal.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
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

import React, { useState, useEffect } from 'react';
import { Plus, Apple, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

// Import components
import DateNavigation from '@/components/nutrition/DateNavigation';
import DailySummary from '@/components/nutrition/DailySummary';
import MealSection from '@/components/nutrition/MealSection';
import AddFoodDialog from '@/components/nutrition/AddFoodDialog';
import BarcodeScannerDialog from '@/components/nutrition/BarcodeScannerDialog';
import NutritionTabs from '@/components/nutrition/NutritionTabs';
import WaterTracking from '@/components/nutrition/WaterTracking';
import FoodDatabase, { FoodItem } from '@/components/nutrition/FoodDatabase';

// Define meal type
interface Meal {
  id: string;
  name: string;
  items: FoodItem[];
}

const Nutrition = () => {
  const { t } = useLanguage();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showScanBarcode, setShowScanBarcode] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'meals' | 'water'>('meals');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Breakfast',
      items: [
        { id: '1-1', name: 'Protein Oatmeal', calories: 450, protein: 32, carbs: 60, fat: 10 },
        { id: '1-2', name: 'Black Coffee', calories: 5, protein: 0, carbs: 0, fat: 0 },
      ],
    },
    {
      id: '2',
      name: 'Lunch',
      items: [
        { id: '2-1', name: 'Chicken Salad', calories: 550, protein: 45, carbs: 30, fat: 25 },
        { id: '2-2', name: 'Green Tea', calories: 0, protein: 0, carbs: 0, fat: 0 },
      ],
    },
    {
      id: '3',
      name: 'Snack',
      items: [
        { id: '3-1', name: 'Protein Shake', calories: 220, protein: 25, carbs: 15, fat: 5 },
      ],
    },
    {
      id: '4',
      name: 'Dinner',
      items: [
        { id: '4-1', name: 'Salmon with Vegetables', calories: 620, protein: 48, carbs: 35, fat: 30 },
      ],
    },
  ]);

  // Load meals data for the selected date
  useEffect(() => {
    // In a real app, we would load meals from an API or local storage based on the selected date
    // For now, we'll keep using the static data
  }, [selectedDate]);

  const handleAddItem = (mealId: string) => {
    setSelectedMeal(mealId);
    setShowAddFood(true);
  };

  const handleAddFood = (foodId: string) => {
    const selectedFood = FoodDatabase.find(food => food.id === foodId);
    
    if (selectedFood && selectedMeal) {
      // Deep clone the meals array to avoid direct state mutation
      const updatedMeals = JSON.parse(JSON.stringify(meals));
      const mealIndex = updatedMeals.findIndex((meal: Meal) => meal.id === selectedMeal);
      
      if (mealIndex >= 0) {
        // Add new food item to the selected meal
        updatedMeals[mealIndex].items.push({
          ...selectedFood,
          id: `${selectedMeal}-${Date.now()}`, // Generate a unique ID
        });
        
        setMeals(updatedMeals);
        toast.success(`${selectedFood.name} added to your meal plan`);
      }
    }
    
    setShowAddFood(false);
  };

  const handleDeleteFoodItem = (mealId: string, itemId: string) => {
    // Deep clone the meals array
    const updatedMeals = JSON.parse(JSON.stringify(meals));
    const mealIndex = updatedMeals.findIndex((meal: Meal) => meal.id === mealId);
    
    if (mealIndex >= 0) {
      // Remove the item from the selected meal
      updatedMeals[mealIndex].items = updatedMeals[mealIndex].items.filter(
        (item: FoodItem) => item.id !== itemId
      );
      
      setMeals(updatedMeals);
      toast.success('Food item removed');
    }
  };

  const handleScanBarcode = () => {
    setShowScanBarcode(true);
  };

  const handleAddScannedProduct = () => {
    // In a real app, we would add the scanned product to the selected meal
    toast.success(`Added product to your meal plan`);
    setShowScanBarcode(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("nutrition")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("addFood")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addFood")}</DialogTitle>
                <DialogDescription>Add food to your meal plan</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-4 py-4">
                <Button className="flex-1" onClick={() => setShowAddFood(true)}>
                  <Apple className="mr-2 h-4 w-4" />
                  {t("addFood")}
                </Button>
                <Button className="flex-1" onClick={handleScanBarcode}>
                  <Camera className="mr-2 h-4 w-4" />
                  {t("scanBarcode")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Date Navigation */}
        <DateNavigation 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        {/* Daily Summary */}
        <DailySummary className="mb-6" />
      </div>

      {/* Add Food Dialog */}
      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <AddFoodDialog 
          meals={meals}
          foodDatabase={FoodDatabase}
          selectedMeal={selectedMeal}
          onClose={() => setShowAddFood(false)}
          onAddFood={handleAddFood}
        />
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showScanBarcode} onOpenChange={(open) => {
        if (!open) {
          setShowScanBarcode(false);
        }
      }}>
        <BarcodeScannerDialog
          meals={meals}
          selectedMeal={selectedMeal}
          onClose={() => setShowScanBarcode(false)}
          onAddProduct={handleAddScannedProduct}
        />
      </Dialog>

      <div className="mt-4">
        <div className="glassy-card rounded-xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-medium tracking-tight">{t("todayMeals")}</h3>
            <NutritionTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          
          {activeTab === 'meals' && (
            <div className="divide-y divide-border">
              {meals.map((meal) => (
                <MealSection
                  key={meal.id}
                  id={meal.id}
                  name={meal.name}
                  items={meal.items}
                  onAddItem={handleAddItem}
                  onDeleteItem={handleDeleteFoodItem}
                />
              ))}
            </div>
          )}
          
          {activeTab === 'water' && (
            <div className="p-5">
              <WaterTracking />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;

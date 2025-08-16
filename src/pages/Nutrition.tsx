import React, { useState, useEffect } from 'react';
import { Plus, Apple, Camera, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import components
import DateNavigation from '@/components/nutrition/DateNavigation';
import DailySummary from '@/components/nutrition/DailySummary';
import MealSection from '@/components/nutrition/MealSection';
import AddFoodDialog from '@/components/nutrition/AddFoodDialog';
import BarcodeScanner from '@/components/nutrition/BarcodeScanner';
import ProductModal from '@/components/nutrition/ProductModal';
import NutritionTabs from '@/components/nutrition/NutritionTabs';
import WaterTracking from '@/components/nutrition/WaterTracking';
import AIMealAnalyzer from '@/components/nutrition/AIMealAnalyzer';
import { saveFoodLog, getFoodLogs, deleteFoodLog, ProductDetails } from '@/services/openFoodFactsService';
import { FoodItem, FoodLogEntry, getAvailableMeals } from '@/types/nutrition';

// Define meal type
interface Meal {
  id: string;
  name: string;
  items: FoodItem[];
}

const Nutrition = () => {
  const { t, language } = useLanguage();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showScanBarcode, setShowScanBarcode] = useState(false);
  const [showAIMealAnalyzer, setShowAIMealAnalyzer] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductDetails | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'meals' | 'water'>('meals');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [meals, setMeals] = useState<Meal[]>([]);

  // Initialize meals when component mounts or language changes
  useEffect(() => {
    const initializeMeals = () => {
      const availableMeals = getAvailableMeals();
      const initializedMeals = availableMeals.map(meal => ({
        id: meal.id,
        name: meal.name,
        items: []
      }));
      console.log('Initializing meals:', initializedMeals);
      setMeals(initializedMeals);
    };

    initializeMeals();

    // Listen for custom meals changes
    const handleMealsChanged = () => {
      initializeMeals();
    };

    window.addEventListener('mealsChanged', handleMealsChanged);
    
    return () => {
      window.removeEventListener('mealsChanged', handleMealsChanged);
    };
  }, [language]); // Only depend on language, not meals

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Fallback to localStorage for demo or when not logged in
  const loadFoodLogsFromLocalStorage = (mealsToUpdate: Meal[]) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const savedData = localStorage.getItem(`foodLog_${dateStr}`);
    
    console.log('Loading from localStorage for date:', dateStr, 'Data:', savedData);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Reset meal items
        const updatedMeals = mealsToUpdate.map(meal => ({
          ...meal,
          items: []
        }));
        
        // Add items to appropriate meals
        parsedData.forEach((item: any) => {
          if (item.mealId) {
            const mealIndex = updatedMeals.findIndex(meal => meal.id === item.mealId);
            if (mealIndex >= 0) {
              updatedMeals[mealIndex].items.push(item);
            }
          }
        });
        
        console.log('Updated meals with localStorage data:', updatedMeals);
        setMeals(updatedMeals);
      } catch (error) {
        console.error('Error parsing local food data:', error);
      }
    } else {
      console.log('No localStorage data found for date:', dateStr);
      setMeals(mealsToUpdate);
    }
  };

  // Load food logs for the selected date - removed meals dependency to prevent infinite loop
  useEffect(() => {
    const loadFoodLogs = async () => {
      // Don't load if meals are not yet initialized
      if (!meals || meals.length === 0) {
        console.log('Meals not initialized yet, waiting...');
        return;
      }

      setIsLoading(true);
      
      try {
        if (!isAuthenticated || !userId) {
          // If not authenticated, load from local storage for demo
          console.log('Not authenticated, loading from localStorage');
          loadFoodLogsFromLocalStorage(meals);
          return;
        }
        
        // Format date as YYYY-MM-DD for consistency
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        console.log('Loading food logs from database for date:', dateStr);
        const logs = await getFoodLogs(dateStr);
        
        // Reset meal items
        const updatedMeals = meals.map(meal => ({
          ...meal,
          items: []
        }));
        
        // Add food items to appropriate meals
        logs.forEach((log: FoodLogEntry) => {
          const mealIndex = updatedMeals.findIndex(meal => meal.id === log.meal_id);
          
          if (mealIndex >= 0) {
            updatedMeals[mealIndex].items.push({
              ...log.food_item,
              logId: log.id // Store the log ID for deletion
            });
          }
        });
        
        console.log('Updated meals with database data:', updatedMeals);
        setMeals(updatedMeals);
      } catch (error) {
        console.error('Error loading food logs:', error);
        toast.error(t('errorLoadingData') || 'Error loading food data');
      } finally {
        setIsLoading(false);
      }
    };

    // Only run if we have meals initialized
    if (meals.length > 0) {
      loadFoodLogs();
    }
  }, [selectedDate, isAuthenticated, userId, refreshTrigger, t]); // Removed meals dependency

  // Save food logs to localStorage for demo
  const saveFoodLogsToLocalStorage = (updatedMeals: Meal[]) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Collect all food items from all meals
    const allItems = updatedMeals.flatMap(meal => 
      meal.items.map(item => ({
        ...item,
        mealId: meal.id
      }))
    );
    
    localStorage.setItem(`foodLog_${dateStr}`, JSON.stringify(allItems));
    console.log('Saved to localStorage:', allItems);
  };

  const handleAddItem = (mealId: string) => {
    setSelectedMeal(mealId);
    setShowAddFood(true);
  };

  const handleAddFood = async (foodItem: any) => {
    const mealId = foodItem.mealId || selectedMeal;
    
    if (!mealId) {
      toast.error(t('selectMealFirst'));
      return;
    }
    
    // Create a copy of current meals to avoid direct state mutation
    const updatedMeals = [...meals];
    const mealIndex = updatedMeals.findIndex(meal => meal.id === mealId);
    
    if (mealIndex >= 0) {
      // Add new food item with unique ID
      const newFoodItem = {
        ...foodItem,
        id: `${mealId}-${Date.now()}`,
      };
      
      updatedMeals[mealIndex].items.push(newFoodItem);
      
      // Save to database if authenticated, otherwise to localStorage
      try {
        if (isAuthenticated) {
          const dateStr = selectedDate.toISOString().split('T')[0];
          await saveFoodLog(newFoodItem, mealId, dateStr);
        } else {
          // Fallback to localStorage
          saveFoodLogsToLocalStorage(updatedMeals);
        }
        
        setMeals(updatedMeals);
        // Trigger a refresh of the summary
        setRefreshTrigger(prev => prev + 1);
        toast.success(`${foodItem.name} ${t('addedToMealPlan')}`);
      } catch (error) {
        console.error('Error saving food log:', error);
        toast.error(t('errorSavingData'));
      }
    }
    
    setShowAddFood(false);
  };

  const handleDeleteFoodItem = async (mealId: string, itemId: string) => {
    // Create a copy of current meals to avoid direct state mutation
    const updatedMeals = [...meals];
    const mealIndex = updatedMeals.findIndex(meal => meal.id === mealId);
    
    if (mealIndex >= 0) {
      // Find the item to delete
      const itemIndex = updatedMeals[mealIndex].items.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        // Get item before removing (for Supabase deletion)
        const item = updatedMeals[mealIndex].items[itemIndex];
        
        // Remove the item
        updatedMeals[mealIndex].items.splice(itemIndex, 1);
        
        try {
          if (isAuthenticated && item.logId) {
            // Delete from Supabase
            await deleteFoodLog(item.logId);
          } else {
            // Update localStorage
            saveFoodLogsToLocalStorage(updatedMeals);
          }
          
          setMeals(updatedMeals);
          // Trigger a refresh of the summary
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.error('Error deleting food log:', error);
          toast.error(t('errorDeletingData'));
        }
      }
    }
  };

  const handleScanBarcode = () => {
    setShowScanBarcode(true);
  };

  const handleProductScanned = (product: ProductDetails) => {
    setScannedProduct(product);
    setShowScanBarcode(false);
    setShowProductModal(true);
  };

  const handleAddScannedProduct = (product: ProductDetails) => {
    // Convert to food item format
    const foodItem = {
      id: `${selectedMeal || '1'}-${Date.now()}`,
      name: product.name,
      brand: product.brand,
      calories: Math.round(product.nutrition.calories),
      protein: Math.round(product.nutrition.protein * 10) / 10,
      carbs: Math.round(product.nutrition.carbs * 10) / 10,
      fat: Math.round(product.nutrition.fat * 10) / 10,
      servingSize: `${product.amount || 100} ${product.unit || 'g'}`,
      servings: product.servings || 1,
      mealId: selectedMeal || '1',
      imageUrl: product.imageUrl
    };
    
    handleAddFood(foodItem);
    setShowProductModal(false);
    setScannedProduct(null);
  };

  const handleScanAgain = () => {
    setShowProductModal(false);
    setScannedProduct(null);
    setShowScanBarcode(true);
  };

  const handleAIMealAnalyzer = () => {
    setShowAIMealAnalyzer(true);
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
              <Button data-testid="add-food-trigger">
                <Plus className="mr-2 h-4 w-4" />
                {t("Add food")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Add food")}</DialogTitle>
                <DialogDescription>Search for a product, scan, or analyze with AI</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-4">
                <Button className="flex-1" onClick={() => setShowAddFood(true)}>
                  <Apple className="mr-2 h-4 w-4" />
                  {t("Add food")}
                </Button>
                <Button className="flex-1" onClick={handleScanBarcode}>
                  <Camera className="mr-2 h-4 w-4" />
                  Scan Barcode
                </Button>
                <Button className="flex-1" onClick={handleAIMealAnalyzer}>
                  <Bot className="mr-2 h-4 w-4" />
                  AI Meal Analyzer
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
        <DailySummary 
          className="mb-6" 
          meals={meals}
          selectedDate={selectedDate}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Add Food Dialog */}
      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent className="p-0">
          <AddFoodDialog 
            meals={meals}
            selectedMeal={selectedMeal}
            onClose={() => setShowAddFood(false)}
            onAddFood={handleAddFood}
          />
        </DialogContent>
      </Dialog>

      {/* AI Meal Analyzer Dialog */}
      <Dialog open={showAIMealAnalyzer} onOpenChange={setShowAIMealAnalyzer}>
        <DialogContent className="p-0">
          <AIMealAnalyzer
            meals={meals}
            onClose={() => setShowAIMealAnalyzer(false)}
            onAddFood={handleAddFood}
          />
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showScanBarcode} onOpenChange={setShowScanBarcode}>
        <BarcodeScanner
          key={showScanBarcode ? 'scanner-open' : 'scanner-closed'}
          onClose={() => setShowScanBarcode(false)}
          onProductScanned={handleProductScanned}
        />
      </Dialog>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        {scannedProduct && (
          <ProductModal
            product={scannedProduct}
            meals={meals}
            selectedMeal={selectedMeal}
            onClose={() => setShowProductModal(false)}
            onAddProduct={handleAddScannedProduct}
            onScanAgain={handleScanAgain}
          />
        )}
      </Dialog>

      <div className="mt-4">
        <div className="glassy-card rounded-xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-medium tracking-tight">{t("Today Meals")}</h3>
            <NutritionTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          
          {activeTab === 'meals' ? (
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">{t("loading")}</p>
                </div>
              ) : (
                meals.map((meal) => (
                  <MealSection
                    key={meal.id}
                    id={meal.id}
                    name={meal.name}
                    items={meal.items}
                    onAddItem={handleAddItem}
                    onDeleteItem={handleDeleteFoodItem}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="p-5">
              <WaterTracking />
            </div>
          )}
        </div>
      </div>
      
      {!isAuthenticated && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
          <p className="text-sm">
            {t('Login To Save Nutrition Data')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Nutrition;

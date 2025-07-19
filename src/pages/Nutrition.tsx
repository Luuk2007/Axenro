import React, { useState, useEffect } from 'react';
import { Plus, Apple, Camera } from 'lucide-react';
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
import { saveFoodLog, getFoodLogs, deleteFoodLog, ProductDetails } from '@/services/openFoodFactsService';
import { FoodItem, FoodLogEntry } from '@/types/nutrition';

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
  const [showProductModal, setShowProductModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductDetails | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'meals' | 'water'>('meals');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Initialize empty meals structure
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: language === 'dutch' ? 'Ontbijt' : 'Breakfast',
      items: [],
    },
    {
      id: '2',
      name: language === 'dutch' ? 'Lunch' : 'Lunch',
      items: [],
    },
    {
      id: '3',
      name: language === 'dutch' ? 'Avondeten' : 'Dinner',
      items: [],
    },
    {
      id: '4',
      name: language === 'dutch' ? 'Snack' : 'Snack',
      items: [],
    },
  ]);

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

  // Update meal names when language changes
  useEffect(() => {
    // Update meal names based on language
    setMeals(currentMeals => {
      const updatedMeals = [...currentMeals];
      
      if (language === 'dutch') {
        updatedMeals[0].name = 'Ontbijt';
        updatedMeals[1].name = 'Lunch';
        updatedMeals[2].name = 'Avondeten';
        updatedMeals[3].name = 'Snack';
      } else {
        updatedMeals[0].name = 'Breakfast';
        updatedMeals[1].name = 'Lunch';
        updatedMeals[2].name = 'Dinner';
        updatedMeals[3].name = 'Snack';
      }
      
      return updatedMeals;
    });
  }, [language]);

  // Load food logs for the selected date
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      // If not authenticated, load from local storage for demo
      loadFoodLogsFromLocalStorage();
      return;
    }
    
    // Format date as YYYY-MM-DD for consistency
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const loadFoodLogs = async () => {
      setIsLoading(true);
      try {
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
        
        setMeals(updatedMeals);
      } catch (error) {
        console.error('Error loading food logs:', error);
        toast.error(t('errorLoadingData') || 'Error loading food data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFoodLogs();
  }, [selectedDate, isAuthenticated, userId, refreshTrigger, t]);

  // Fallback to localStorage for demo or when not logged in
  const loadFoodLogsFromLocalStorage = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const savedData = localStorage.getItem(`foodLog_${dateStr}`);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Reset meal items
        const updatedMeals = meals.map(meal => ({
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
        
        setMeals(updatedMeals);
      } catch (error) {
        console.error('Error parsing local food data:', error);
      }
    }
  };

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
                <DialogDescription>Search for a product or scan to add</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-4 py-4">
                <Button className="flex-1" onClick={() => setShowAddFood(true)}>
                  <Apple className="mr-2 h-4 w-4" />
                  {t("addFood")}
                </Button>
                <Button className="flex-1" onClick={handleScanBarcode}>
                  <Camera className="mr-2 h-4 w-4" />
                  Scan Barcode
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

      {/* Barcode Scanner Dialog */}
      <Dialog open={showScanBarcode} onOpenChange={setShowScanBarcode}>
        <BarcodeScanner
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

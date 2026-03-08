import React, { useState, useEffect } from 'react';
import { Plus, Apple, Camera, Bot, Utensils, GlassWater, ChefHat, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPrompt } from '@/components/auth/LoginPrompt';
import { useSubscription } from '@/hooks/useSubscription';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import components
import DateNavigation from '@/components/nutrition/DateNavigation';
import DailySummary from '@/components/nutrition/DailySummary';
import MealSection from '@/components/nutrition/MealSection';
import AddFoodDialog from '@/components/nutrition/AddFoodDialog';
import BarcodeScanner from '@/components/nutrition/BarcodeScanner';
import ProductModal from '@/components/nutrition/ProductModal';
import WaterTracking from '@/components/nutrition/WaterTracking';
import AIMealAnalyzer from '@/components/nutrition/AIMealAnalyzer';
import RecipesManager from '@/components/nutrition/RecipesManager';
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
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { test_subscription_tier } = useSubscription();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showScanBarcode, setShowScanBarcode] = useState(false);
  const [showAIMealAnalyzer, setShowAIMealAnalyzer] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMealOptionsModal, setShowMealOptionsModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductDetails | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const mealStructureRef = React.useRef<Meal[]>([]);
  
  const isLoading = !initialized || meals.length === 0;

  // Initialize meals when component mounts or language changes
  useEffect(() => {
    const initializeMeals = () => {
      const availableMeals = getAvailableMeals();
      const initializedMeals = availableMeals.map(meal => ({
        id: meal.id,
        name: meal.name,
        items: []
      }));
      mealStructureRef.current = initializedMeals;
      setMeals(initializedMeals);
    };

    initializeMeals();

    const handleMealsChanged = () => {
      initializeMeals();
    };

    window.addEventListener('mealsChanged', handleMealsChanged);
    
    return () => {
      window.removeEventListener('mealsChanged', handleMealsChanged);
    };
  }, [language]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const loadFoodLogsFromLocalStorage = (mealsToUpdate: Meal[]) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const savedData = localStorage.getItem(`foodLog_${dateStr}`);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const updatedMeals = mealsToUpdate.map(meal => ({ ...meal, items: [] }));
        
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
    } else {
      setMeals(mealsToUpdate);
    }
  };

  useEffect(() => {
    const loadFoodLogs = async () => {
      if (!meals || meals.length === 0) return;
      
      try {
        if (!isAuthenticated || !userId) {
          loadFoodLogsFromLocalStorage(meals);
          return;
        }
        
        const dateStr = selectedDate.toISOString().split('T')[0];
        const logs = await getFoodLogs(dateStr);
        
        const updatedMeals = meals.map(meal => ({ ...meal, items: [] }));
        
        logs.forEach((log: FoodLogEntry) => {
          const mealIndex = updatedMeals.findIndex(meal => meal.id === log.meal_id);
          if (mealIndex >= 0) {
            const foodItem = {
              ...log.food_item,
              id: log.id,
              logId: log.id
            };
            updatedMeals[mealIndex].items.push(foodItem);
          }
        });
        
        setMeals(updatedMeals);
      } catch (error) {
        console.error('Error loading food logs:', error);
        toast.error(t('errorLoadingData') || 'Error loading food data');
      } finally {
        setInitialized(true);
      }
    };

    if (meals.length > 0) {
      loadFoodLogs();
    }

    const handleFoodLogUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('foodLogUpdated', handleFoodLogUpdate);
    return () => window.removeEventListener('foodLogUpdated', handleFoodLogUpdate);
  }, [selectedDate, isAuthenticated, userId, refreshTrigger, t]);

  const saveFoodLogsToLocalStorage = (updatedMeals: Meal[]) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const allItems = updatedMeals.flatMap(meal => 
      meal.items.map(item => ({ ...item, mealId: meal.id }))
    );
    localStorage.setItem(`foodLog_${dateStr}`, JSON.stringify(allItems));
  };

  const handleAddItem = (mealId: string) => {
    setSelectedMeal(mealId);
    if (test_subscription_tier === 'free') {
      setShowAddFood(true);
    } else {
      setShowMealOptionsModal(true);
    }
  };

  const handleAddFood = async (foodItem: any) => {
    const mealId = foodItem.mealId || selectedMeal;
    if (!mealId) { toast.error(t('selectMealFirst')); return; }
    
    const updatedMeals = [...meals];
    const mealIndex = updatedMeals.findIndex(meal => meal.id === mealId);
    
    if (mealIndex >= 0) {
      if (editingItem) {
        try {
          const itemIndex = updatedMeals[mealIndex].items.findIndex(item => item.id === editingItem.id);
          if (itemIndex >= 0) {
            const updatedItem = { ...foodItem, id: editingItem.id, logId: editingItem.logId };
            updatedMeals[mealIndex].items[itemIndex] = updatedItem;
            
            if (isAuthenticated && editingItem.logId) {
              await deleteFoodLog(editingItem.logId);
              const dateStr = selectedDate.toISOString().split('T')[0];
              await saveFoodLog(updatedItem, mealId, dateStr);
            } else {
              saveFoodLogsToLocalStorage(updatedMeals);
            }
            
            setMeals(updatedMeals);
            setRefreshTrigger(prev => prev + 1);
            toast.success(`${foodItem.name} ${t('updated successfully')}`);
            window.dispatchEvent(new CustomEvent('foodLogUpdated'));
          }
        } catch (error) {
          console.error('Error updating food log:', error);
          toast.error(t('errorSavingData'));
        }
      } else {
        const newFoodItem = { ...foodItem, id: `${mealId}-${Date.now()}` };
        updatedMeals[mealIndex].items.push(newFoodItem);
        
        try {
          if (isAuthenticated) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            await saveFoodLog(newFoodItem, mealId, dateStr);
          } else {
            saveFoodLogsToLocalStorage(updatedMeals);
          }
          
          setMeals(updatedMeals);
          setRefreshTrigger(prev => prev + 1);
          toast.success(`${foodItem.name} ${t('added to meal plan')}`);
          window.dispatchEvent(new CustomEvent('foodLogUpdated'));
        } catch (error) {
          console.error('Error saving food log:', error);
          toast.error(t('errorSavingData'));
        }
      }
    }
    
    setEditingItem(null);
    setShowAddFood(false);
  };

  const handleDeleteFoodItem = async (mealId: string, itemId: string) => {
    const updatedMeals = [...meals];
    const mealIndex = updatedMeals.findIndex(meal => meal.id === mealId);
    
    if (mealIndex >= 0) {
      const itemIndex = updatedMeals[mealIndex].items.findIndex(item => item.id === itemId);
      if (itemIndex >= 0) {
        const item = updatedMeals[mealIndex].items[itemIndex];
        updatedMeals[mealIndex].items.splice(itemIndex, 1);
        
        try {
          if (isAuthenticated && item.logId) {
            await deleteFoodLog(item.logId);
          } else {
            saveFoodLogsToLocalStorage(updatedMeals);
          }
          toast.success(t('Food item deleted'));
          setMeals(updatedMeals);
          setRefreshTrigger(prev => prev + 1);
          window.dispatchEvent(new CustomEvent('foodLogUpdated'));
        } catch (error) {
          console.error('Error deleting food log:', error);
          toast.error(t('errorDeletingData'));
        }
      }
    }
  };

  const handleEditFoodItem = (mealId: string, item: FoodItem) => {
    setEditingItem(item);
    setSelectedMeal(mealId);
    setShowAddFood(true);
  };

  const handleScanBarcode = () => setShowScanBarcode(true);

  const handleProductScanned = (product: ProductDetails) => {
    setScannedProduct(product);
    setShowScanBarcode(false);
    setShowProductModal(true);
  };

  const handleAddScannedProduct = (product: ProductDetails) => {
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

  const handleAIMealAnalyzer = () => setShowAIMealAnalyzer(true);

  const getAddFoodOptions = () => {
    const options = [];
    options.push({
      key: 'search', icon: Apple, label: t("Add food"),
      action: () => { setShowMealOptionsModal(false); setShowAddFood(true); }
    });
    if (test_subscription_tier === 'pro' || test_subscription_tier === 'premium') {
      options.push({
        key: 'barcode', icon: Camera, label: t("Scan Barcode"),
        action: () => { setShowMealOptionsModal(false); handleScanBarcode(); }
      });
    }
    if (test_subscription_tier === 'premium') {
      options.push({
        key: 'ai', icon: Bot, label: t("AI Meal Analyzer"),
        action: () => { setShowMealOptionsModal(false); handleAIMealAnalyzer(); }
      });
    }
    return options;
  };

  const addFoodOptions = getAddFoodOptions();

  // Handler to add recipe to meals - switch to today tab & open add food
  const handleAddRecipeToMeals = () => {
    setActiveTab('today');
    setShowAddFood(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-28 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-[600px] bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-x-hidden">
      {!user && <LoginPrompt />}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{t("nutrition")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{t("Track your daily food intake and macros")}</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'today' && (
            test_subscription_tier === 'free' ? (
              <Button 
                onClick={() => setShowAddFood(true)}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add food")}
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("Add food")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("Add food")}</DialogTitle>
                    <DialogDescription>
                      {test_subscription_tier === 'pro' 
                        ? t("Search for a product or scan a barcode")
                        : t("Search for a product, scan, or analyze with AI")
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 py-4">
                    {addFoodOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <Button key={option.key} className="flex-1 rounded-xl" onClick={option.action}>
                          <IconComponent className="mr-2 h-4 w-4" />
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            )
          )}
        </div>
      </div>

      {/* Top-level Tabs - like Workouts page */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="today" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4 mr-1 sm:mr-2" />
            {t("Today")}
          </TabsTrigger>
          <TabsTrigger value="recipes" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm">
            <ChefHat className="h-4 w-4 mr-1 sm:mr-2" />
            {t("Recipes")}
          </TabsTrigger>
          <TabsTrigger value="water" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm">
            <GlassWater className="h-4 w-4 mr-1 sm:mr-2" />
            {t("Water")}
          </TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="mt-6 space-y-4">
          <DateNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <DailySummary className="mb-6" meals={meals} selectedDate={selectedDate} refreshTrigger={refreshTrigger} />
          
          {meals.map((meal) => (
            <MealSection
              key={meal.id}
              id={meal.id}
              name={meal.name}
              items={meal.items}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteFoodItem}
              onEditItem={handleEditFoodItem}
            />
          ))}
        </TabsContent>

        {/* Recipes Tab - Full sub-page */}
        <TabsContent value="recipes" className="mt-6">
          <RecipesManager onAddToMeals={handleAddRecipeToMeals} />
        </TabsContent>

        {/* Water Tab */}
        <TabsContent value="water" className="mt-6">
          <WaterTracking />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showMealOptionsModal} onOpenChange={setShowMealOptionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add food")}</DialogTitle>
            <DialogDescription>
              {test_subscription_tier === 'pro' 
                ? "Search for a product or scan a barcode"
                : "Search for a product, scan, or analyze with AI"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            {addFoodOptions.map(option => {
              const IconComponent = option.icon;
              return (
                <Button key={option.key} className="flex-1" onClick={option.action}>
                  <IconComponent className="mr-2 h-4 w-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddFood} onOpenChange={(open) => {
        setShowAddFood(open);
        if (!open) setEditingItem(null);
      }}>
        <DialogContent className="p-0">
          <AddFoodDialog 
            meals={meals}
            selectedMeal={selectedMeal}
            editingItem={editingItem}
            onClose={() => { setShowAddFood(false); setEditingItem(null); }}
            onAddFood={handleAddFood}
          />
        </DialogContent>
      </Dialog>

      {test_subscription_tier === 'premium' && (
        <Dialog open={showAIMealAnalyzer} onOpenChange={setShowAIMealAnalyzer}>
          <DialogContent className="p-0">
            <AIMealAnalyzer meals={meals} onClose={() => setShowAIMealAnalyzer(false)} onAddFood={handleAddFood} />
          </DialogContent>
        </Dialog>
      )}

      {(test_subscription_tier === 'pro' || test_subscription_tier === 'premium') && (
        <Dialog open={showScanBarcode} onOpenChange={setShowScanBarcode}>
          <BarcodeScanner
            key={showScanBarcode ? 'scanner-open' : 'scanner-closed'}
            onClose={() => setShowScanBarcode(false)}
            onProductScanned={handleProductScanned}
          />
        </Dialog>
      )}

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
      
      {!isAuthenticated && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
          <p className="text-sm">{t('Login To Save Nutrition Data')}</p>
        </div>
      )}
    </div>
  );
};

export default Nutrition;

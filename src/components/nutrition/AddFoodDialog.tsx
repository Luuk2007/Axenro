
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ScanLine, Package, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BarcodeScanner from './BarcodeScanner';
import { searchOpenFoodFacts, type ProductDetails } from '@/services/openFoodFactsService';
import { predefinedFoods } from './FoodDatabase';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';

interface AddFoodDialogProps {
  onAddFood: (food: any) => void;
  selectedMeal?: string;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const defaultFoodItem: FoodItem = {
  name: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export default function AddFoodDialog({ onAddFood, selectedMeal }: AddFoodDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { hasFeature } = useFeatureAccess();
  const [searchValue, setSearchValue] = useState('');
  const [apiResults, setApiResults] = useState<ProductDetails[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string>(selectedMeal || "");
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [servings, setServings] = useState(1);
  const [amount, setAmount] = useState<number>(100);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const meals = [
    { id: "1", name: t("breakfast") },
    { id: "2", name: t("lunch") },
    { id: "3", name: t("dinner") },
    { id: "4", name: t("snacks") }
  ];

  useEffect(() => {
    if (searchValue.length >= 2) {
      handleSearch();
    } else {
      setApiResults([]);
    }
  }, [searchValue]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const results = await searchOpenFoodFacts(searchValue);
      setApiResults(results);
    } catch (error) {
      console.error("Error during API search:", error);
      toast.error(t("Error searching for food items"));
    } finally {
      setSearching(false);
    }
  };

  const handleBarcodeClick = () => {
    if (!hasFeature('barcodeScanner')) {
      toast.error(t('Barcode scanner is a Pro feature'));
      setShowSubscriptionModal(true);
      return;
    }
    setShowBarcodeScanner(true);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setShowBarcodeScanner(false);
    setSearching(true);
    try {
      const results = await searchOpenFoodFacts(barcode);
      if (results.length > 0) {
        setSelectedProduct(results[0]);
        setActiveTab('search');
        setSearchValue(results[0].name || '');
      } else {
        toast.error(t("No product found with this barcode"));
      }
    } catch (error) {
      console.error("Error during barcode search:", error);
      toast.error(t("Error searching for food item"));
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduct = (product: ProductDetails) => {
    setSelectedProduct(product);
  };

  const handleAddFood = async () => {
    if (!selectedProduct) {
      toast.error(t("Please select a food item"));
      return;
    }

    if (!selectedMealId) {
      toast.error(t("Please select a meal"));
      return;
    }

    const calories = (selectedProduct.nutrition?.calories || 0) * (amount / 100) * servings;
    const protein = (selectedProduct.nutrition?.protein || 0) * (amount / 100) * servings;
    const carbs = (selectedProduct.nutrition?.carbs || 0) * (amount / 100) * servings;
    const fat = (selectedProduct.nutrition?.fat || 0) * (amount / 100) * servings;

    const foodData = {
      name: selectedProduct.name || "Unknown",
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };

    const newFoodLog = {
      user_id: user?.id,
      date: new Date().toISOString().split('T')[0],
      meal_id: selectedMealId,
      food_item: foodData,
    };

    try {
      const { error } = await supabase
        .from('food_logs')
        .insert([newFoodLog]);

      if (error) {
        throw error;
      }

      toast.success(t("Food item added successfully"));
      onAddFood(newFoodLog);
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error(t("Error adding food item"));
    }
  };

  const filteredPredefinedFoods = predefinedFoods.filter(food =>
    food.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const displayResults = searchValue.length >= 2 
    ? [...apiResults, ...filteredPredefinedFoods]
    : filteredPredefinedFoods;

  if (showBarcodeScanner) {
    return (
      <BarcodeScanner
        onClose={() => setShowBarcodeScanner(false)}
        onProductScanned={(product) => {
          setSelectedProduct(product);
          setShowBarcodeScanner(false);
        }}
      />
    );
  }

  return (
    <>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("addFood")}</DialogTitle>
          <DialogDescription>
            {t("Search for food items or scan a barcode to add to your meal.")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t("Search")}
              </TabsTrigger>
              <TabsTrigger 
                value="barcode" 
                className="flex items-center gap-2"
                onClick={(e) => {
                  if (!hasFeature('barcodeScanner')) {
                    e.preventDefault();
                    handleBarcodeClick();
                  }
                }}
              >
                <ScanLine className="h-4 w-4" />
                {t("Barcode")}
                {!hasFeature('barcodeScanner') && <PlanBadge tier="pro" size="sm" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="flex-1 flex flex-col space-y-4 mt-0">
              <div className="mb-4">
                <Select value={selectedMealId} onValueChange={setSelectedMealId}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={t("Select the meal")} />
                  </SelectTrigger>
                  <SelectContent>
                    {meals.map(meal => (
                      <SelectItem key={meal.id} value={meal.id}>
                        {meal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="search"
                placeholder={t("Search for food")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              <div className="overflow-y-auto flex-1">
                {searching && (
                  <div className="text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 inline-block" />
                    {t("Searching...")}
                  </div>
                )}

                {displayResults.length > 0 ? (
                  <ul className="space-y-2">
                    {displayResults.map((product, index) => (
                      <li
                        key={index}
                        className="p-3 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectProduct(product)}
                      >
                        {product.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  !searching && searchValue.length >= 2 && (
                    <div className="text-center text-muted-foreground">
                      {t("No results found")}
                    </div>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="barcode" className="flex-1 flex flex-col items-center justify-center">
              {hasFeature('barcodeScanner') ? (
                <div className="text-center space-y-4">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("Barcode Scanner")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("Scan product barcodes to quickly add food items")}
                    </p>
                    <Button onClick={() => setShowBarcodeScanner(true)} className="gap-2">
                      <ScanLine className="h-4 w-4" />
                      {t("Start Scanning")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="rounded-full bg-muted p-4 w-fit mx-auto">
                    <ScanLine className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("Barcode Scanner")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("Upgrade to Pro to scan product barcodes")}
                    </p>
                    <Button onClick={handleBarcodeClick} className="gap-2">
                      <ScanLine className="h-4 w-4" />
                      {t("Upgrade to Pro")}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {selectedProduct && (
          <div className="mt-4 p-4 rounded-md bg-muted/50">
            <h4 className="text-lg font-semibold mb-2">{t("Food Details")}</h4>
            <p>
              <strong>{t("Name")}:</strong> {selectedProduct.name}
            </p>
            <p>
              <strong>{t("Calories per 100g")}:</strong> {selectedProduct.nutrition?.calories || 0} kcal
            </p>

            <div className="flex items-center space-x-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("Servings")}</label>
                <input
                  type="number"
                  className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{t("Amount (grams)")}</label>
                <input
                  type="number"
                  className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <Button onClick={handleAddFood} className="w-full mt-4">
              {t("Add Food")}
            </Button>
          </div>
        )}
      </DialogContent>

      <SubscriptionModal 
        open={showSubscriptionModal} 
        onOpenChange={setShowSubscriptionModal} 
      />
    </>
  );
}

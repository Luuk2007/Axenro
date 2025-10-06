
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, Minus, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { searchProductsByName, ProductDetails } from '@/services/openFoodFactsService';
import { calculateNutritionForUnit } from '@/services/foodTypeAnalyzer';
import { useRecentFoods } from '@/hooks/useRecentFoods';

interface Meal {
  id: string;
  name: string;
  items: any[];
}

interface AddFoodDialogProps {
  meals: Meal[];
  selectedMeal: string | null;
  editingItem?: any; // The food item being edited
  onClose: () => void;
  onAddFood: (foodItem: any) => void;
}

const AddFoodDialog = ({ meals, selectedMeal, editingItem, onClose, onAddFood }: AddFoodDialogProps) => {
  const { t, language } = useLanguage();
  const { recentFoods, addRecentFood } = useRecentFoods();
  const [searchValue, setSearchValue] = useState('');
  const [apiResults, setApiResults] = useState<ProductDetails[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string>(selectedMeal || "");
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [servings, setServings] = useState(1);
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>("gram");

  // Pre-populate form when editing
  useEffect(() => {
    if (editingItem) {
      // Create a mock ProductDetails from the existing food item
      const mockProduct: ProductDetails = {
        id: editingItem.id || 'mock-id',
        name: editingItem.name,
        description: editingItem.name, // Use name as description
        brand: editingItem.brand || '',
        imageUrl: editingItem.imageUrl || null,
        servingSize: editingItem.servingSize || '100g',
        servings: editingItem.servings || 1,
        amount: editingItem.amount,
        unit: editingItem.unit,
        nutrition: {
          calories: editingItem.calories || 0,
          protein: editingItem.protein || 0,
          carbs: editingItem.carbs || 0,
          fat: editingItem.fat || 0
        }
      };
      
      setSelectedProduct(mockProduct);
      setServings(editingItem.servings || 1);
      setAmount(editingItem.amount || 100);
      setUnit(editingItem.unit || 'gram');
    }
  }, [editingItem]);

  // Update unit options and defaults when a product is selected
  useEffect(() => {
    if (selectedProduct?.foodAnalysis) {
      const { defaultUnit, defaultAmount } = selectedProduct.foodAnalysis;
      setUnit(defaultUnit);
      setAmount(defaultAmount);
    }
  }, [selectedProduct]);

  // Handle API search - debounced with rate limiting
  useEffect(() => {
    const timer = setTimeout(() => {
      const sanitizedQuery = searchValue.trim();
      if (sanitizedQuery && sanitizedQuery.length >= 2 && sanitizedQuery.length <= 100) {
        searchFromAPI(sanitizedQuery);
      } else {
        setApiResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const searchFromAPI = async (query: string) => {
    // Input validation and sanitization
    const sanitizedQuery = query.trim().replace(/[<>]/g, '');
    
    if (sanitizedQuery.length < 2 || sanitizedQuery.length > 100) {
      console.warn('Invalid query length');
      return;
    }
    
    setSearching(true);
    try {
      const lang = language === 'english' ? 'en' : 
                  language === 'dutch' ? 'nl' : 
                  language === 'french' ? 'fr' : 
                  language === 'german' ? 'de' : 
                  language === 'spanish' ? 'es' : 'en';
      
      const results = await searchProductsByName(sanitizedQuery, lang);
      setApiResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setApiResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduct = (product: ProductDetails) => {
    setSelectedProduct(product);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  const calculateAdjustedNutrition = () => {
    if (!selectedProduct) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const isLiquid = selectedProduct.foodAnalysis?.category === 'liquid';
    return calculateNutritionForUnit(
      selectedProduct.nutrition,
      amount,
      unit,
      servings,
      isLiquid
    );
  };

  const handleAddProduct = () => {
    if (selectedProduct) {
      const adjustedNutrition = calculateAdjustedNutrition();
      
      const foodItem = {
        id: `${selectedMealId}-${Date.now()}`,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        calories: Math.round(adjustedNutrition.calories),
        protein: Math.round(adjustedNutrition.protein * 10) / 10,
        carbs: Math.round(adjustedNutrition.carbs * 10) / 10,
        fat: Math.round(adjustedNutrition.fat * 10) / 10,
        servingSize: `${amount} ${t(unit)}`,
        servings,
        amount,
        unit,
        mealId: selectedMealId,
        imageUrl: selectedProduct.imageUrl
      };
      
      // Save to recent foods
      addRecentFood({
        id: foodItem.id,
        name: foodItem.name,
        brand: foodItem.brand,
        imageUrl: foodItem.imageUrl,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        servingSize: foodItem.servingSize,
        amount: foodItem.amount,
        unit: foodItem.unit,
        servings: foodItem.servings
      });
      
      onAddFood(foodItem);
    }
  };

  const handleSelectRecentFood = (recentFood: any) => {
    const mockProduct: ProductDetails = {
      id: recentFood.id,
      name: recentFood.name,
      description: recentFood.name,
      brand: recentFood.brand || '',
      imageUrl: recentFood.imageUrl || null,
      servingSize: recentFood.servingSize,
      servings: recentFood.servings,
      amount: recentFood.amount,
      unit: recentFood.unit,
      nutrition: {
        calories: recentFood.calories,
        protein: recentFood.protein,
        carbs: recentFood.carbs,
        fat: recentFood.fat
      }
    };
    
    setSelectedProduct(mockProduct);
    setServings(recentFood.servings);
    setAmount(recentFood.amount);
    setUnit(recentFood.unit);
  };

  const getAvailableUnits = () => {
    if (!selectedProduct?.foodAnalysis) {
      return ['gram', 'milliliter', 'piece', 'slice', 'cup', 'tablespoon', 'teaspoon'];
    }
    return selectedProduct.foodAnalysis.appropriateUnits;
  };

  return (
    <DialogContent className="sm:max-w-md mx-auto p-0 gap-0">
      <DialogHeader className="p-4 pb-3 text-center">
        <DialogTitle className="text-xl font-semibold">
          {editingItem ? t("Edit food") : t("Add food")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("Search foods")}
        </DialogDescription>
      </DialogHeader>
      
      {selectedProduct ? (
        <div className="px-4 pb-4">
          {/* Product Image and Info */}
          <div className="text-center mb-4">
            {selectedProduct.imageUrl && (
              <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden bg-muted">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h2 className="text-lg font-bold text-foreground mb-1">{selectedProduct.name}</h2>
            {selectedProduct.brand && (
              <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
            )}
            {selectedProduct.foodAnalysis && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedProduct.foodAnalysis.category === 'liquid' ? '🥛 Liquid' :
                 selectedProduct.foodAnalysis.category === 'countable' ? '🍎 Countable' :
                 selectedProduct.foodAnalysis.category === 'powder' ? '🥄 Powder' : '🥗 Solid'}
              </p>
            )}
          </div>

          {/* Portion Size */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2">{t("Portion Size")}</h3>
            
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <Input 
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min="0.1"
                  step="0.1"
                  className="text-center h-10"
                />
              </div>
              
              <div className="flex-1">
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="h-10">
                    <SelectValue>{t(unit) || unit}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableUnits().map(unitOption => (
                      <SelectItem key={unitOption} value={unitOption}>
                        {t(unitOption) || unitOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Number of Servings */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2">{t("Number of servings")}</h3>
            <div className="flex items-center justify-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={servings <= 0.25}
                onClick={() => setServings(prev => Math.max(0.25, prev - 0.25))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[60px] text-center">{servings}</span>
              <Button 
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setServings(prev => prev + 0.25)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Meal Selection */}
          <div className="mb-4">
            <Select value={selectedMealId} onValueChange={setSelectedMealId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t("Select the meal")} />
              </SelectTrigger>
              <SelectContent>
                {meals.map(meal => (
                  <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nutrition Summary */}
          <div className="mb-4">
            <h3 className="text-center text-lg font-semibold mb-3">{t("Nutrition summary")}</h3>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(calculateAdjustedNutrition().carbs * 10) / 10}g
                </div>
                <div className="text-xs text-muted-foreground">{t("Carbs")}</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-orange-500">
                  {Math.round(calculateAdjustedNutrition().fat * 10) / 10}g
                </div>
                <div className="text-xs text-muted-foreground">{t("Fat")}</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(calculateAdjustedNutrition().protein * 10) / 10}g
                </div>
                <div className="text-xs text-muted-foreground">{t("Protein")}</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-blue-500">
                  {Math.round(calculateAdjustedNutrition().calories)} cal
                </div>
                <div className="text-xs text-muted-foreground">Cal</div>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <Button 
            className="w-full h-12 text-base font-semibold" 
            onClick={handleAddProduct}
          >
            <Plus className="mr-2 h-4 w-4" />
            {editingItem ? t("Update meal") : t("Add to meal plan")}
          </Button>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">{t("Meal")}</label>
            <Select 
              value={selectedMealId}
              onValueChange={setSelectedMealId}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t("Select the meal")} />
              </SelectTrigger>
              <SelectContent>
                {meals.map(meal => (
                  <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">{t("Food")}</label>
            <div className="relative">
              <Input 
                placeholder={t("Search foods")} 
                onChange={(e) => setSearchValue(e.target.value)} 
                value={searchValue}
                className="pr-10 h-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Recent Foods Section */}
          {!searchValue && recentFoods.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">{t("Recently added")}</label>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {recentFoods.map(food => (
                  <div 
                    key={food.id} 
                    className="flex items-center justify-between bg-secondary/30 p-2 rounded-md cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => handleSelectRecentFood(food)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {food.imageUrl && (
                        <img 
                          src={food.imageUrl} 
                          alt={food.name} 
                          className="w-8 h-8 object-contain rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{food.name}</p>
                        {food.brand && (
                          <p className="text-xs text-muted-foreground truncate">{food.brand}</p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {food.calories} cal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="max-h-64 overflow-y-auto">
            {apiResults.length > 0 && (
              <div className="space-y-2">
                {apiResults.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between bg-secondary/30 p-2 rounded-md cursor-pointer hover:bg-secondary/50"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="flex items-center gap-2">
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                        <div className="text-xs text-muted-foreground">
                          {product.nutrition.calories} cal | P: {product.nutrition.protein}g | C: {product.nutrition.carbs}g | F: {product.nutrition.fat}g
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {apiResults.length === 0 && !searching && searchValue && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t("No results found")}
              </div>
            )}
            
            {!searchValue && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t("Type to search")}
              </div>
            )}
            
            {searching && (
              <div className="text-center py-8">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">{t("loading")}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose} size="sm">{t("cancel")}</Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default AddFoodDialog;

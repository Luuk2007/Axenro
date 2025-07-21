
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, X, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { searchProductsByName, ProductDetails } from '@/services/openFoodFactsService';

interface Meal {
  id: string;
  name: string;
  items: any[];
}

interface AddFoodDialogProps {
  meals: Meal[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddFood: (foodItem: any) => void;
}

const AddFoodDialog = ({ meals, selectedMeal, onClose, onAddFood }: AddFoodDialogProps) => {
  const { t, language } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [apiResults, setApiResults] = useState<ProductDetails[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string>(selectedMeal || "1");
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [servings, setServings] = useState(1);
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>("gram");

  // Handle API search - debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue && searchValue.length >= 2) {
        searchFromAPI(searchValue);
      } else {
        setApiResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const searchFromAPI = async (query: string) => {
    setSearching(true);
    try {
      // Get appropriate language code
      const lang = language === 'english' ? 'en' : 
                  language === 'dutch' ? 'nl' : 
                  language === 'french' ? 'fr' : 
                  language === 'german' ? 'de' : 
                  language === 'spanish' ? 'es' : 'en';
      
      const results = await searchProductsByName(query, lang);
      setApiResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
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

  const calculateAdjustedValue = (value: number): number => {
    // First adjust for amount (per 100g/ml base)
    const adjustedForAmount = (value * amount) / 100;
    // Then multiply by servings
    return adjustedForAmount * servings;
  };

  const handleAddProduct = () => {
    if (selectedProduct) {
      // Calculate nutritional values based on amount/servings
      const foodItem = {
        id: `${selectedMealId}-${Date.now()}`,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        calories: Math.round(calculateAdjustedValue(selectedProduct.nutrition.calories)),
        protein: Math.round(calculateAdjustedValue(selectedProduct.nutrition.protein) * 10) / 10,
        carbs: Math.round(calculateAdjustedValue(selectedProduct.nutrition.carbs) * 10) / 10,
        fat: Math.round(calculateAdjustedValue(selectedProduct.nutrition.fat) * 10) / 10,
        servingSize: `${amount} ${t(unit)}`,
        servings,
        amount,
        unit,
        mealId: selectedMealId,
        imageUrl: selectedProduct.imageUrl
      };
      
      onAddFood(foodItem);
    }
  };

  const handleBackToSearch = () => {
    setSelectedProduct(null);
  };

  return (
    <DialogContent className="max-w-sm max-h-[90vh] flex flex-col p-0">
      <DialogHeader className="p-3 pb-0">
        <DialogTitle className="text-lg">{t("addFood")}</DialogTitle>
        <DialogDescription className="text-sm">
          {t("Search foods")}
        </DialogDescription>
      </DialogHeader>
      
      {selectedProduct ? (
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="p-4 text-center border-b bg-card">
            <h3 className="text-lg font-semibold text-foreground">{t("addToMeal")}</h3>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-background">
            {/* Product Image and Info */}
            <div className="text-center mb-4">
              {selectedProduct.imageUrl && (
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden bg-muted shadow-md">
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
            </div>

            {/* Portion Size Section */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground mb-3">{t("portionSize")}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{t("amount")}</label>
                  <Input 
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    min="1"
                    className="text-sm font-medium h-10 text-center"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{t("unit")}</label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="h-10 text-sm font-medium">
                      <SelectValue>{t(unit) || unit}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gram">{t("gram")}</SelectItem>
                      <SelectItem value="milliliter">{t("milliliter")}</SelectItem>
                      <SelectItem value="piece">{t("piece")}</SelectItem>
                      <SelectItem value="slice">{t("slice")}</SelectItem>
                      <SelectItem value="cup">{t("cup")}</SelectItem>
                      <SelectItem value="tablespoon">{t("tablespoon")}</SelectItem>
                      <SelectItem value="teaspoon">{t("teaspoon")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Number of Servings */}
              <div className="mt-4">
                <label className="text-xs text-muted-foreground block mb-2">{t("numberOfServings")}</label>
                <div className="flex items-center justify-center">
                  <div className="flex items-center bg-muted rounded-lg overflow-hidden">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 rounded-none hover:bg-background"
                      disabled={servings <= 0.25}
                      onClick={() => setServings(prev => Math.max(0.25, prev - 0.25))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="bg-background px-4 py-2 min-w-[60px] text-center">
                      <span className="text-lg font-semibold">{servings}</span>
                    </div>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 rounded-none hover:bg-background"
                      onClick={() => setServings(prev => prev + 0.25)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Meal Selection */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground block mb-2">{t("addToMeal")}</label>
              <Select value={selectedMealId} onValueChange={setSelectedMealId}>
                <SelectTrigger className="h-10 text-sm font-medium">
                  <SelectValue placeholder={t("selectMeal")} />
                </SelectTrigger>
                <SelectContent>
                  {meals.map(meal => (
                    <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nutrition Summary */}
            <div className="bg-card border rounded-xl p-4 mb-4">
              <h3 className="text-base font-semibold text-center mb-4">{t("nutritionSummary")}</h3>
              
              {/* Calories Display */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(calculateAdjustedValue(selectedProduct.nutrition.calories))} cal
                </div>
              </div>
              
              {/* Macros in a clean row */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600 mb-1">
                    {Math.round(calculateAdjustedValue(selectedProduct.nutrition.carbs) * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{t("carbs")}</div>
                </div>
                
                <div>
                  <div className="text-lg font-bold text-orange-500 mb-1">
                    {Math.round(calculateAdjustedValue(selectedProduct.nutrition.fat) * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{t("fat")}</div>
                </div>
                
                <div>
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    {Math.round(calculateAdjustedValue(selectedProduct.nutrition.protein) * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{t("protein")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer with Add Button */}
          <div className="p-4 border-t bg-background">
            <Button 
              className="w-full h-12 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90" 
              onClick={handleAddProduct}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("addToMealPlan")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-3 flex-1 overflow-y-auto flex flex-col bg-background">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Meal")}</label>
            <Select 
              defaultValue={selectedMealId}
              onValueChange={setSelectedMealId}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t("selectMeal")} />
              </SelectTrigger>
              <SelectContent>
                {meals.map(meal => (
                  <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Food")}</label>
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
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* API Results */}
            <div className="mb-3">
              <h3 className="text-sm font-medium mb-2">{apiResults.length > 0 ? t("onlineResults") : ""}</h3>
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
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                        <div className="text-xs text-muted-foreground">
                          {product.nutrition.calories} cal | P: {product.nutrition.protein}g | C: {product.nutrition.carbs}g | F: {product.nutrition.fat}g
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {apiResults.length === 0 && !searching && searchValue && (
                  <div className="text-center py-3 text-sm text-muted-foreground">
                    {t("No results found")}
                  </div>
                )}
                
                {!searchValue && (
                  <div className="text-center py-3 text-sm text-muted-foreground">
                    {t("Type to search")}
                  </div>
                )}
                
                {searching && (
                  <div className="text-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{t("loading")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end p-3 border-t border-border bg-background">
            <Button variant="outline" onClick={onClose}>{t("cancel")}</Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default AddFoodDialog;

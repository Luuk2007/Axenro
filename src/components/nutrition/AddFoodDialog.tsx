
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
    // Base calculation on the user-entered amount/unit
    if (unit === "gram" || unit === "milliliter") {
      return (value * amount) / 100; // Assuming nutrition values are per 100g/ml
    } else {
      // For pieces, slices, etc., multiply by servings
      return value * servings;
    }
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
    <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
      <DialogHeader className="p-4 pb-0">
        <DialogTitle>{t("addFood")}</DialogTitle>
        <DialogDescription>
          {t("searchFoods")}
        </DialogDescription>
      </DialogHeader>
      
      {selectedProduct ? (
        <div className="flex flex-col h-full max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <Button variant="ghost" size="sm" onClick={handleBackToSearch}>
              <X className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <h3 className="font-semibold">{t("addToMeal")}</h3>
            <div></div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            {/* Product Info */}
            <div className="text-center mb-6">
              {selectedProduct.imageUrl && (
                <div className="w-24 h-24 mx-auto mb-3 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h2 className="text-lg font-bold text-foreground">{selectedProduct.name}</h2>
              {selectedProduct.brand && (
                <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
              )}
            </div>

            {/* Portion Controls */}
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-base">{t("portionSize")}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">{t("amount")}</label>
                  <Input 
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    min="1"
                    className="text-center"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">{t("unit")}</label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
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

              {/* Servings Counter */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">{t("numberOfServings")}</label>
                <div className="flex items-center border rounded-lg px-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={servings <= 0.25}
                    onClick={() => setServings(prev => Math.max(0.25, prev - 0.25))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={servings}
                    min="0.25"
                    step="0.25"
                    onChange={(e) => setServings(Number(e.target.value) || 1)}
                    className="border-0 bg-transparent text-center w-16 h-8 p-0 focus-visible:ring-0"
                  />
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setServings(prev => prev + 0.25)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Meal Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground block mb-2">{t("addToMeal")}</label>
              <Select value={selectedMealId} onValueChange={setSelectedMealId}>
                <SelectTrigger>
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
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-3 text-center">{t("nutritionSummary")}</h3>
              
              {/* Calories Circle */}
              <div className="flex justify-center mb-4">
                <div className="bg-background rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-sm border">
                  <span className="text-xl font-bold text-foreground">
                    {Math.round(calculateAdjustedValue(selectedProduct.nutrition.calories))}
                  </span>
                  <span className="text-xs text-muted-foreground">cal</span>
                </div>
              </div>
              
              {/* Macros */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {Math.round(calculateAdjustedValue(selectedProduct.nutrition.carbs) * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground">{t("carbs")}</div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {Math.round(calculateAdjustedValue(selectedProduct.nutrition.fat) * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground">{t("fat")}</div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round(calculateAdjustedValue(selectedProduct.nutrition.protein) * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground">{t("protein")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-background">
            <Button className="w-full" onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addToMealPlan")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 flex-1 overflow-y-auto flex flex-col bg-background">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("meal")}</label>
            <Select 
              defaultValue={selectedMealId}
              onValueChange={setSelectedMealId}
            >
              <SelectTrigger>
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
            <label className="text-sm font-medium">{t("food")}</label>
            <div className="relative">
              <Input 
                placeholder={t("searchFoods")} 
                onChange={(e) => setSearchValue(e.target.value)} 
                value={searchValue}
                className="pr-10"
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
            <div className="mb-4">
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
                          className="w-10 h-10 object-contain"
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
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    {t("noResultsFound")}
                  </div>
                )}
                
                {!searchValue && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    {t("typeToSearch")}
                  </div>
                )}
                
                {searching && (
                  <div className="text-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{t("loading")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end p-4 border-t border-border bg-background">
            <Button variant="outline" onClick={onClose}>{t("cancel")}</Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default AddFoodDialog;

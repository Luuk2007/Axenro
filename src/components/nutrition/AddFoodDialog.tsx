
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
    if (unit === "gram" || unit === "milliliter") {
      return (value * amount * servings) / 100;
    } else {
      return value * servings;
    }
  };

  const handleAddProduct = () => {
    if (selectedProduct) {
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
    <DialogContent className="sm:max-w-md mx-auto p-0 gap-0">
      <DialogHeader className="p-4 pb-3 text-center">
        <DialogTitle className="text-xl font-semibold">{t("addFood")}</DialogTitle>
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
          </div>

          {/* Portion Size */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2">{t("portionSize")}</h3>
            
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <Input 
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min="1"
                  className="text-center h-10"
                />
              </div>
              
              <div className="flex-1">
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="h-10">
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
          </div>

          {/* Number of Servings */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2">{t("Number Of Servings")}</h3>
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
          <div className="mb-4">
            <h3 className="text-center text-lg font-semibold mb-3">{t("nutritionSummary")}</h3>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(calculateAdjustedValue(selectedProduct.nutrition.carbs) * 10) / 10}g
                </div>
                <div className="text-xs text-muted-foreground">{t("carbs")}</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-orange-500">
                  {Math.round(calculateAdjustedValue(selectedProduct.nutrition.fat) * 10) / 10}g
                </div>
                <div className="text-xs text-muted-foreground">{t("fat")}</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(calculateAdjustedValue(selectedProduct.nutrition.protein) * 10) / 10}g
                </div>
                <div className="text-xs text-muted-foreground">{t("protein")}</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-blue-500">
                  {Math.round(calculateAdjustedValue(selectedProduct.nutrition.calories))} cal
                </div>
                <div className="text-xs text-muted-foreground">cal</div>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <Button 
            className="w-full h-12 text-base font-semibold" 
            onClick={handleAddProduct}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("Add To Meal Plan")}
          </Button>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">{t("Meal")}</label>
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

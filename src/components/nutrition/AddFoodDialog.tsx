
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { searchProductsByName, ProductDetails } from '@/services/openFoodFactsService';
import FoodDatabase from './FoodDatabase';

interface Meal {
  id: string;
  name: string;
  items: any[];
}

interface AddFoodDialogProps {
  meals: Meal[];
  foodDatabase: any[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddFood: (foodItem: any) => void;
}

const AddFoodDialog = ({ meals, foodDatabase, selectedMeal, onClose, onAddFood }: AddFoodDialogProps) => {
  const { t, language } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<any[]>(foodDatabase);
  const [apiResults, setApiResults] = useState<ProductDetails[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string>(selectedMeal || "1");

  // Handle local database search
  const handleLocalSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      setFilteredFoods(foodDatabase.filter(food => 
        food.name.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setFilteredFoods(foodDatabase);
    }
  };

  // Handle API search - debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue && searchValue.length >= 3) {
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

  const handleAddLocalFood = (foodId: string) => {
    const food = foodDatabase.find(item => item.id === foodId);
    if (food) {
      onAddFood({
        ...food,
        mealId: selectedMealId
      });
    }
  };

  const handleAddAPIFood = (product: ProductDetails) => {
    const foodItem = {
      id: `${selectedMealId}-${Date.now()}`,
      name: product.name,
      brand: product.brand,
      calories: product.nutrition.calories,
      protein: product.nutrition.protein,
      carbs: product.nutrition.carbs,
      fat: product.nutrition.fat,
      servingSize: product.servingSize,
      servings: product.servings || 1,
      mealId: selectedMealId,
      imageUrl: product.imageUrl
    };
    
    onAddFood(foodItem);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>{t("addFood")}</DialogTitle>
        <DialogDescription>
          {t("searchFoods") || "Search for food or add a custom item"}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("meal")}</label>
          <Select 
            defaultValue={selectedMealId}
            onValueChange={setSelectedMealId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectMeal") || "Select meal"} />
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
              placeholder={t("searchFoods") || "Search foods..."} 
              onChange={(e) => handleLocalSearch(e.target.value)} 
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
          {apiResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">{t("onlineResults") || "Online Results"}</h3>
              <div className="space-y-2">
                {apiResults.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between bg-secondary/30 p-2 rounded-md cursor-pointer hover:bg-secondary/50"
                    onClick={() => handleAddAPIFood(product)}
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
              </div>
            </div>
          )}
          
          {/* Local Database */}
          <div>
            <h3 className="text-sm font-medium mb-2">{filteredFoods.length > 0 ? (t("localDatabase") || "Local Database") : ""}</h3>
            <div className="space-y-2">
              {filteredFoods.map(food => (
                <div 
                  key={food.id} 
                  className="flex items-center justify-between bg-secondary/30 p-2 rounded-md cursor-pointer hover:bg-secondary/50"
                  onClick={() => handleAddLocalFood(food.id)}
                >
                  <div>
                    <p className="font-medium">{food.name}</p>
                    <div className="text-xs text-muted-foreground">
                      {food.calories} cal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {filteredFoods.length === 0 && apiResults.length === 0 && !searching && searchValue && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {t("noResultsFound") || "No results found"}
                </div>
              )}
              
              {!searchValue && filteredFoods.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {t("typeToSearch") || "Type to search for foods"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-border">
        <Button variant="outline" onClick={onClose}>{t("cancel") || "Cancel"}</Button>
      </div>
    </DialogContent>
  );
};

export default AddFoodDialog;

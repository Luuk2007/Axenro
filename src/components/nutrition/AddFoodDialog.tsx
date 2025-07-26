
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Loader2 } from 'lucide-react';
import { FoodItem, NutritionData } from '@/types/nutrition';
import { searchOpenFoodFacts } from '@/services/openFoodFactsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { SecurityUtils } from '@/utils/security';
import { useSecureInput } from '@/hooks/useSecureInput';
import { toast } from 'sonner';

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFood: (food: FoodItem) => void;
}

export default function AddFoodDialog({ open, onOpenChange, onAddFood }: AddFoodDialogProps) {
  const { t } = useLanguage();
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Use secure input for search query
  const searchInput = useSecureInput('', { 
    type: 'search', 
    maxLength: 100 
  });

  // Use secure input for quantity
  const quantityInput = useSecureInput('100', { 
    type: 'number',
    min: 0.1,
    max: 10000,
    required: true
  });

  const handleSearch = async () => {
    if (!searchInput.isValid || !searchInput.value.trim()) {
      toast.error(t('Please enter a search term'));
      return;
    }

    // Check rate limiting for search requests
    const userKey = `search_${Date.now() % 3600000}`; // Simple rate limiting key
    if (!SecurityUtils.checkRateLimit(userKey, 30, 60000)) {
      toast.error(t('Too many search requests. Please wait a moment.'));
      return;
    }

    try {
      setLoading(true);
      setSearchResults([]);
      
      const results = await searchOpenFoodFacts(searchInput.value);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info(t('No results found. Try a different search term.'));
      }
    } catch (error) {
      console.error('Search error:', error);
      SecurityUtils.logSecurityEvent('food_search_error', { 
        query: searchInput.value,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error(t('Search failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = () => {
    if (!selectedFood || !quantityInput.isValid) {
      toast.error(t('Please select a food item and enter a valid quantity'));
      return;
    }

    const qty = parseFloat(quantityInput.value);
    if (qty <= 0) {
      toast.error(t('Quantity must be greater than 0'));
      return;
    }

    // Scale nutrition values based on quantity
    const scaledFood: FoodItem = {
      ...selectedFood,
      name: SecurityUtils.escapeHtml(selectedFood.name),
      calories: Math.round((selectedFood.calories * qty) / 100),
      protein: Math.round((selectedFood.protein * qty) / 100 * 10) / 10,
      carbs: Math.round((selectedFood.carbs * qty) / 100 * 10) / 10,
      fat: Math.round((selectedFood.fat * qty) / 100 * 10) / 10,
      quantity: qty,
    };

    onAddFood(scaledFood);
    
    // Reset form
    searchInput.reset();
    quantityInput.updateValue('100');
    setSelectedFood(null);
    setSearchResults([]);
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addFood')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={t('searchFoodPlaceholder')}
                value={searchInput.value}
                onChange={(e) => searchInput.updateValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className={searchInput.error ? 'border-red-500' : ''}
              />
              {searchInput.error && (
                <p className="text-sm text-red-500 mt-1">{searchInput.error}</p>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || !searchInput.isValid}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h3 className="font-medium">{t('searchResults')}:</h3>
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`p-3 border rounded cursor-pointer hover:bg-muted transition-colors ${
                    selectedFood?.id === food.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="font-medium">{SecurityUtils.escapeHtml(food.name)}</div>
                  <div className="text-sm text-muted-foreground">
                    {food.calories} {t('kcalPer100g')} | 
                    {t('protein')}: {food.protein}g | 
                    {t('carbs')}: {food.carbs}g | 
                    {t('fat')}: {food.fat}g
                  </div>
                  {food.brand && (
                    <div className="text-xs text-muted-foreground">
                      {t('brand')}: {SecurityUtils.escapeHtml(food.brand)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedFood && (
            <div className="p-4 border rounded bg-muted/50">
              <h3 className="font-medium mb-2">{t('selectedFood')}:</h3>
              <p className="font-medium">{SecurityUtils.escapeHtml(selectedFood.name)}</p>
              <div className="flex gap-4 mt-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">{t('quantity')} (g):</label>
                  <Input
                    type="number"
                    value={quantityInput.value}
                    onChange={(e) => quantityInput.updateValue(e.target.value)}
                    min="0.1"
                    max="10000"
                    step="0.1"
                    className={`mt-1 ${quantityInput.error ? 'border-red-500' : ''}`}
                  />
                  {quantityInput.error && (
                    <p className="text-sm text-red-500 mt-1">{quantityInput.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                searchInput.reset();
                quantityInput.updateValue('100');
                setSelectedFood(null);
                setSearchResults([]);
              }}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleAddFood} 
              disabled={!selectedFood || !quantityInput.isValid}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('addFood')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Search, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@/types/nutrition';
import { FoodDatabase } from './FoodDatabase';
import { SecureBarcodeScanner } from './SecureBarcodeScanner';
import { validateFoodName, logSecurityEvent } from '@/utils/security';
import { toast } from 'sonner';

interface AddFoodDialogProps {
  open: boolean;
  onClose: () => void;
  onAddFood: (food: FoodItem) => void;
}

export const AddFoodDialog: React.FC<AddFoodDialogProps> = ({
  open,
  onClose,
  onAddFood,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showScanner, setShowScanner] = useState(false);

  const searchResults = FoodDatabase.search(searchTerm);

  const handleSearchChange = (value: string) => {
    try {
      // Validate search input for security
      if (value.length > 0) {
        const validatedValue = validateFoodName(value);
        setSearchTerm(validatedValue);
      } else {
        setSearchTerm(value);
      }
    } catch (error) {
      toast.error('Invalid search term');
      logSecurityEvent('INVALID_SEARCH_INPUT', { input: value });
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    try {
      const food = FoodDatabase.findByBarcode(barcode);
      if (food) {
        setSelectedFood(food);
        setShowScanner(false);
      } else {
        toast.error('Product not found');
        logSecurityEvent('BARCODE_NOT_FOUND', { barcode });
      }
    } catch (error) {
      toast.error('Error processing barcode');
      logSecurityEvent('BARCODE_PROCESSING_ERROR', { barcode, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    try {
      const foodToAdd: FoodItem = {
        ...selectedFood,
        calories: selectedFood.calories * quantity,
        protein: selectedFood.protein * quantity,
        carbs: selectedFood.carbs * quantity,
        fat: selectedFood.fat * quantity,
      };

      onAddFood(foodToAdd);
      onClose();
      setSelectedFood(null);
      setQuantity(1);
      setSearchTerm('');
      
      logSecurityEvent('FOOD_ADDED', { foodId: selectedFood.id, quantity });
    } catch (error) {
      toast.error('Error adding food item');
      logSecurityEvent('FOOD_ADD_ERROR', { foodId: selectedFood?.id, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  if (showScanner) {
    return (
      <SecureBarcodeScanner
        onBarcodeDetected={handleBarcodeDetected}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Food</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search food..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScanner(true)}
              className="h-9 px-3"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {selectedFood ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                {selectedFood.imageUrl && (
                  <img
                    src={selectedFood.imageUrl}
                    alt={selectedFood.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{selectedFood.name}</h3>
                  {selectedFood.brand && (
                    <p className="text-xs text-gray-500 truncate">{selectedFood.brand}</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {Math.round(selectedFood.calories * quantity)} cal
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {Math.round(selectedFood.protein * quantity)}g protein
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 0.5)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedFood(null)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleAddFood} className="flex-1">
                  Add Food
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedFood(food)}
                >
                  {food.imageUrl && (
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{food.name}</p>
                    {food.brand && (
                      <p className="text-xs text-gray-500 truncate">{food.brand}</p>
                    )}
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {food.calories} cal
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {food.protein}g protein
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

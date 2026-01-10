
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Utensils, Edit, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { FoodItem } from '@/types/nutrition';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MealSectionProps {
  id: string;
  name: string;
  items: FoodItem[];
  onAddItem: (mealId: string) => void;
  onDeleteItem: (mealId: string, itemId: string) => void;
  onEditItem: (mealId: string, item: FoodItem) => void;
}

const MealSection = ({ id, name, items, onAddItem, onDeleteItem, onEditItem }: MealSectionProps) => {
  const { t } = useLanguage();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDeleteItem(id, itemToDelete);
      toast.success(t('Food item removed') || 'Food item removed');
      setItemToDelete(null);
    }
  };

  const handleAddItem = () => {
    onAddItem(id);
  };

  const handleEditItem = (item: FoodItem) => {
    onEditItem(id, item);
  };

  // Calculate meal totals
  const mealTotals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Generate gradient based on meal name
  const getMealGradient = () => {
    const gradients: Record<string, string> = {
      'breakfast': 'from-orange-500 to-amber-500',
      'lunch': 'from-green-500 to-emerald-500',
      'dinner': 'from-purple-500 to-pink-500',
      'snacks': 'from-blue-500 to-cyan-500',
    };
    const lowerName = name.toLowerCase();
    for (const [key, gradient] of Object.entries(gradients)) {
      if (lowerName.includes(key) || lowerName.includes(t(key).toLowerCase())) {
        return gradient;
      }
    }
    return 'from-primary to-primary/60';
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${getMealGradient()}`} />
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full bg-gradient-to-br ${getMealGradient()} p-2`}>
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{name}</h4>
                {items.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {mealTotals.calories} cal • {Math.round(mealTotals.protein)}g {t("protein")}
                  </p>
                )}
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8"
              onClick={handleAddItem}
            >
              <Plus className="mr-1 h-3 w-3" />
              {t("Add item")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {items.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">{t('No food items yet')}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={handleAddItem}
              >
                <Plus className="mr-1 h-3 w-3" />
                {t("Add your first item")}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className={`h-0.5 bg-gradient-to-r ${getMealGradient()}`} />
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                            {item.calories} cal
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {Math.round(item.protein * 10) / 10}g P
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            {Math.round(item.carbs * 10) / 10}g C
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                            {Math.round(item.fat * 10) / 10}g F
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditItem(item)}
                          title={t("Edit")}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteItem(item.id)}
                          title={t("Delete")}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">{t("Delete")}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t('Confirm delete food') || 'Are you sure you want to delete this food item?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-sm">{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MealSection;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Utensils, Edit } from 'lucide-react';
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

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Utensils className="mr-2 h-4 w-4 text-primary" />
            <h4 className="font-medium">{name}</h4>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 text-xs"
            onClick={handleAddItem}
          >
            <Plus className="mr-1 h-3 w-3" />
            {t("Add item")}
          </Button>
        </div>
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground py-2 text-center">
              {t('No food items yet')}
            </div>
          )}
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between bg-secondary/30 rounded-lg p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <div className="flex text-xs text-muted-foreground space-x-2 mt-1">
                  <span>{item.calories} cal</span>
                  <span>{Math.round(item.protein * 10) / 10}g {t("protein")}</span>
                  <span>{Math.round(item.carbs * 10) / 10}g {t("carbs")}</span>
                  <span>{Math.round(item.fat * 10) / 10}g {t("fat")}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0"
                  onClick={() => handleEditItem(item)}
                  title={t("Edit")}
                >
                  <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0"
                  onClick={() => handleDeleteItem(item.id)}
                  title={t("Delete")}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

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

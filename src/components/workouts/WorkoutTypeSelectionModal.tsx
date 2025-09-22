import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkoutTypeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: 'strength' | 'cardio') => void;
}

const WorkoutTypeSelectionModal = ({ open, onOpenChange, onSelectType }: WorkoutTypeSelectionModalProps) => {
  const { t } = useLanguage();

  const handleSelectType = (type: 'strength' | 'cardio') => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>{t("Select Workout Type")}</DialogTitle>
          <DialogDescription>
            {t("Choose the type of workout you want to create")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
            onClick={() => handleSelectType('strength')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t("Strength Training")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Weight lifting, resistance exercises with sets and reps")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
            onClick={() => handleSelectType('cardio')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Heart className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t("Cardio")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Running, cycling, swimming and other cardio activities")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutTypeSelectionModal;
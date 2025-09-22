import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkoutTypeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: 'strength' | 'cardio') => void;
}

const WorkoutTypeSelectionModal = ({ open, onOpenChange, onSelectType }: WorkoutTypeSelectionModalProps) => {
  const { t } = useLanguage();

  const handleTypeSelect = (type: 'strength' | 'cardio') => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("selectWorkoutType")}</DialogTitle>
          <DialogDescription>
            {t("chooseWorkoutTypeDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => handleTypeSelect('strength')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{t("strengthTraining")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("strengthTrainingDescription")}
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => handleTypeSelect('cardio')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">{t("cardioTraining")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("cardioTrainingDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutTypeSelectionModal;
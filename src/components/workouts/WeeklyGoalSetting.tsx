import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface WeeklyGoalSettingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WeeklyGoalSetting = ({ open, onOpenChange }: WeeklyGoalSettingProps) => {
  const { t } = useLanguage();
  const { profile, saveProfile } = useUserProfile();
  const [weeklyGoal, setWeeklyGoal] = useState(3);

  useEffect(() => {
    if (profile?.weekly_workout_goal) {
      setWeeklyGoal(profile.weekly_workout_goal);
    }
  }, [profile]);

  const handleSave = async () => {
    await saveProfile({
      ...profile,
      weekly_workout_goal: weeklyGoal,
    });
    toast.success(t('Weekly goal updated'));
    onOpenChange(false);
  };

  const incrementGoal = () => {
    if (weeklyGoal < 7) {
      setWeeklyGoal(weeklyGoal + 1);
    }
  };

  const decrementGoal = () => {
    if (weeklyGoal > 1) {
      setWeeklyGoal(weeklyGoal - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Weekly workout goal')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>{t('How many times per week do you want to workout?')}</Label>
            <div className="flex items-center justify-center gap-4 py-4">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementGoal}
                disabled={weeklyGoal <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary">
                <span className="text-3xl font-bold text-primary">{weeklyGoal}</span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={incrementGoal}
                disabled={weeklyGoal >= 7}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {weeklyGoal === 1 ? t('workout per week') : t('workouts per week')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('Cancel')}
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {t('Save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyGoalSetting;

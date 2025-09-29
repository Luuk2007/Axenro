import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WeeklyGoalSetting() {
  const { t } = useLanguage();
  const { profile, saveProfile } = useUserProfile();
  const [goal, setGoal] = useState(profile?.weekly_workout_goal?.toString() || '3');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const goalNum = parseInt(goal);
    if (isNaN(goalNum) || goalNum < 1 || goalNum > 14) {
      toast.error('Please enter a valid goal (1-14 workouts per week)');
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile({
        ...profile,
        weekly_workout_goal: goalNum,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-4 bg-secondary/20 border-border">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-medium text-sm">{t('weeklyWorkoutGoal') || 'Weekly Workout Goal'}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t('setWeeklyGoalDescription') || 'Set how many times you want to workout per week'}
            </p>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="weekly-goal" className="text-xs">{t('workoutsPerWeek') || 'Workouts per week'}</Label>
              <Input
                id="weekly-goal"
                type="number"
                min="1"
                max="14"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? t('saving') || 'Saving...' : t('save') || 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

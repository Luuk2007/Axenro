
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const macroTargets = {
  calories: { consumed: 1840, goal: 2200 },
  protein: { consumed: 130, goal: 175, unit: 'g' },
  carbs: { consumed: 240, goal: 275, unit: 'g' },
  fat: { consumed: 65, goal: 73, unit: 'g' },
};

export default function MacroProgressTracker() {
  const { t } = useLanguage();
  
  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.round((consumed / goal) * 100);
  };

  return (
    <div className="glassy-card rounded-xl overflow-hidden card-shadow">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-medium tracking-tight">{t("todaysProgress")}</h3>
      </div>
      <div className="p-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MacroProgressItem 
          label={t("calories")}
          consumed={macroTargets.calories.consumed}
          goal={macroTargets.calories.goal}
          unit=""
          color="#4F46E5"
        />
        <MacroProgressItem 
          label={t("protein")}
          consumed={macroTargets.protein.consumed}
          goal={macroTargets.protein.goal}
          unit={t("grams")}
          color="#10B981"
        />
        <MacroProgressItem 
          label={t("carbs")}
          consumed={macroTargets.carbs.consumed}
          goal={macroTargets.carbs.goal}
          unit={t("grams")}
          color="#F59E0B"
        />
        <MacroProgressItem 
          label={t("fat")}
          consumed={macroTargets.fat.consumed}
          goal={macroTargets.fat.goal}
          unit={t("grams")}
          color="#EC4899"
        />
      </div>
    </div>
  );
}

interface MacroProgressItemProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  color: string;
}

function MacroProgressItem({ label, consumed, goal, unit, color }: MacroProgressItemProps) {
  const { t } = useLanguage();
  const percentage = calculatePercentage(consumed, goal);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
        <div 
          className="h-full rounded-full"
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("consumed")}: {consumed}{unit}</span>
        <span>{t("remaining")}: {goal - consumed}{unit}</span>
      </div>
    </div>
  );
}

function calculatePercentage(consumed: number, goal: number) {
  return Math.round((consumed / goal) * 100);
}

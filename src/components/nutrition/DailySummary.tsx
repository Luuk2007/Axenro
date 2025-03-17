
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type MacroData = {
  calories: { consumed: number; goal: number; unit: string };
  protein: { consumed: number; goal: number; unit: string };
  carbs: { consumed: number; goal: number; unit: string };
  fat: { consumed: number; goal: number; unit: string };
};

const defaultMacroTargets: MacroData = {
  calories: { consumed: 0, goal: 2200, unit: '' },
  protein: { consumed: 0, goal: 165, unit: 'g' },
  carbs: { consumed: 0, goal: 220, unit: 'g' },
  fat: { consumed: 0, goal: 73, unit: 'g' },
};

interface DailySummaryProps {
  className?: string;
}

export default function DailySummary({ className }: DailySummaryProps) {
  const { t } = useLanguage();
  const [macroTargets] = React.useState<MacroData>(defaultMacroTargets);

  return (
    <div className={`flex flex-nowrap gap-6 overflow-x-auto pb-2 ${className}`}>
      <div className="flex-shrink-0 border rounded-lg p-2 min-w-[160px]">
        <div className="text-xs text-muted-foreground">{t("calories")}</div>
        <div className="text-lg font-semibold">{macroTargets.calories.consumed} / {macroTargets.calories.goal}</div>
      </div>
      
      <div className="flex-shrink-0 border rounded-lg p-2 min-w-[120px]">
        <div className="text-xs text-muted-foreground">{t("protein")}</div>
        <div className="text-lg font-semibold">{macroTargets.protein.consumed}g / {macroTargets.protein.goal}g</div>
      </div>
      
      <div className="flex-shrink-0 border rounded-lg p-2 min-w-[120px]">
        <div className="text-xs text-muted-foreground">{t("carbs")}</div>
        <div className="text-lg font-semibold">{macroTargets.carbs.consumed}g / {macroTargets.carbs.goal}g</div>
      </div>
      
      <div className="flex-shrink-0 border rounded-lg p-2 min-w-[120px]">
        <div className="text-xs text-muted-foreground">{t("fat")}</div>
        <div className="text-lg font-semibold">{macroTargets.fat.consumed}g / {macroTargets.fat.goal}g</div>
      </div>
    </div>
  );
}

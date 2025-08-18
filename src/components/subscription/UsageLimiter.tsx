
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useLanguage } from '@/contexts/LanguageContext';

interface UsageLimiterProps {
  feature: 'customExercises' | 'customMeals';
  currentUsage: number;
  label: string;
}

export const UsageLimiter: React.FC<UsageLimiterProps> = ({ 
  feature, 
  currentUsage, 
  label 
}) => {
  const { getFeatureLimit, currentTier } = useFeatureAccess();
  const { t } = useLanguage();
  
  const limit = getFeatureLimit(feature);
  const isUnlimited = limit === Infinity;
  const percentage = isUnlimited ? 0 : (currentUsage / limit) * 100;
  const isNearLimit = percentage > 80;

  if (isUnlimited) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={isNearLimit ? 'text-orange-600' : 'text-muted-foreground'}>
          {currentUsage}/{limit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
      />
      {isNearLimit && (
        <p className="text-xs text-orange-600">
          {t('You\'re approaching your limit. Upgrade to get more!')}
        </p>
      )}
    </div>
  );
};


import React from 'react';
import { useFeatureAccess, type FeatureName } from '@/hooks/useFeatureAccess';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateProps {
  feature: FeatureName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  currentUsage?: number;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  currentUsage 
}) => {
  const { canUseFeature } = useFeatureAccess();

  if (canUseFeature(feature, currentUsage)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradePrompt feature={feature} />;
};

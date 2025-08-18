
import { useSubscription } from '@/hooks/useSubscription';

export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type FeatureName = 
  | 'darkTheme'
  | 'barcodeScanner'
  | 'customWorkouts'
  | 'customExercises'
  | 'customMeals'
  | 'trainingCalendar'
  | 'plannedWorkouts'
  | 'personalRecords'
  | 'oneRepMaxCalculator'
  | 'bodyMeasurementCharts'
  | 'progressPhotos'
  | 'progressPhotoNotes'
  | 'bmiCalculator'
  | 'aiFeatures';

interface FeatureLimits {
  customExercises: number;
  customMeals: number;
}

const FEATURE_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: { customExercises: 5, customMeals: 0 },
  pro: { customExercises: 5, customMeals: 2 },
  premium: { customExercises: Infinity, customMeals: Infinity }
};

const FEATURE_ACCESS: Record<SubscriptionTier, Record<FeatureName, boolean>> = {
  free: {
    darkTheme: false,
    barcodeScanner: false,
    customWorkouts: false,
    customExercises: true, // limited to 5
    customMeals: false,
    trainingCalendar: false,
    plannedWorkouts: false,
    personalRecords: false,
    oneRepMaxCalculator: false,
    bodyMeasurementCharts: false,
    progressPhotos: false,
    progressPhotoNotes: false,
    bmiCalculator: false, // FREE PLAN DOESN'T HAVE BMI CALCULATOR
    aiFeatures: false
  },
  pro: {
    darkTheme: true,
    barcodeScanner: true,
    customWorkouts: true,
    customExercises: true, // limited to 5
    customMeals: true, // limited to 2
    trainingCalendar: true,
    plannedWorkouts: true,
    personalRecords: true,
    oneRepMaxCalculator: true,
    bodyMeasurementCharts: true,
    progressPhotos: true,
    progressPhotoNotes: false,
    bmiCalculator: true,
    aiFeatures: false
  },
  premium: {
    darkTheme: true,
    barcodeScanner: true,
    customWorkouts: true,
    customExercises: true, // unlimited
    customMeals: true, // unlimited
    trainingCalendar: true,
    plannedWorkouts: true,
    personalRecords: true,
    oneRepMaxCalculator: true,
    bodyMeasurementCharts: true,
    progressPhotos: true,
    progressPhotoNotes: true,
    bmiCalculator: true,
    aiFeatures: true
  }
};

export const useFeatureAccess = () => {
  const { subscribed, subscription_tier, loading } = useSubscription();
  
  const getCurrentTier = (): SubscriptionTier => {
    if (!subscribed) return 'free';
    if (subscription_tier === 'pro') return 'pro';
    if (subscription_tier === 'premium') return 'premium';
    return 'free';
  };

  const hasFeature = (feature: FeatureName): boolean => {
    const tier = getCurrentTier();
    return FEATURE_ACCESS[tier][feature];
  };

  const getFeatureLimit = (feature: keyof FeatureLimits): number => {
    const tier = getCurrentTier();
    return FEATURE_LIMITS[tier][feature];
  };

  const canUseFeature = (feature: FeatureName, currentUsage?: number): boolean => {
    if (!hasFeature(feature)) return false;
    
    // Check limits for features with usage limits
    if (feature === 'customExercises' && currentUsage !== undefined) {
      return currentUsage < getFeatureLimit('customExercises');
    }
    if (feature === 'customMeals' && currentUsage !== undefined) {
      return currentUsage < getFeatureLimit('customMeals');
    }
    
    return true;
  };

  const getUpgradeMessage = (feature: FeatureName): string => {
    const tier = getCurrentTier();
    
    if (tier === 'free') {
      if (FEATURE_ACCESS.pro[feature]) {
        return 'Upgrade to Pro to unlock this feature';
      }
      if (FEATURE_ACCESS.premium[feature]) {
        return 'Upgrade to Premium to unlock this feature';
      }
    }
    
    if (tier === 'pro' && FEATURE_ACCESS.premium[feature] && !FEATURE_ACCESS.pro[feature]) {
      return 'Upgrade to Premium to unlock this feature';
    }
    
    return 'This feature requires a subscription upgrade';
  };

  return {
    currentTier: getCurrentTier(),
    hasFeature,
    canUseFeature,
    getFeatureLimit,
    getUpgradeMessage,
    loading
  };
};

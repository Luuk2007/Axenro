
export interface SubscriptionLimits {
  customMeals: number;
  customExercises: number;
  customMeasurements: number;
}

export const getSubscriptionLimits = (
  subscribed: boolean,
  subscriptionTier: string | null,
  testMode: boolean,
  testSubscriptionTier: string | null
): SubscriptionLimits => {
  // Determine effective tier (considering test mode)
  let effectiveTier = 'free';
  
  if (testMode && testSubscriptionTier) {
    effectiveTier = testSubscriptionTier.toLowerCase();
  } else if (subscribed && subscriptionTier) {
    effectiveTier = subscriptionTier.toLowerCase();
  }

  // Return limits based on tier
  switch (effectiveTier) {
    case 'pro':
      return {
        customMeals: 5,
        customExercises: 5,
        customMeasurements: 5
      };
    case 'premium':
      return {
        customMeals: -1, // -1 means unlimited
        customExercises: -1,
        customMeasurements: -1
      };
    default: // free
      return {
        customMeals: 2,
        customExercises: 2,
        customMeasurements: 2
      };
  }
};

export const formatUsageText = (current: number, limit: number): string => {
  if (limit === -1) return `(${current} used)`;
  return `(${current}/${limit} used)`;
};

export const canAddMore = (current: number, limit: number): boolean => {
  if (limit === -1) return true; // unlimited
  return current < limit;
};

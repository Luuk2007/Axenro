
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { PricingSection } from '@/components/ui/pricing';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { subscribed, subscription_tier, createCheckout, switchToTestTier } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      // Switch to free tier locally for testing
      switchToTestTier('free');
      toast.success(t('Switched to Free plan for testing'));
      onOpenChange(false);
      return;
    }
    
    // For development/testing, allow switching to paid tiers without payment
    if (planId === 'pro' || planId === 'premium') {
      switchToTestTier(planId as 'pro' | 'premium');
      toast.success(t(`Switched to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan for testing`));
      onOpenChange(false);
      return;
    }
    
    // Original payment flow (commented out for testing)
    /*
    try {
      setLoading(planId);
      const billingInterval = 'monthly';
      await createCheckout(planId, billingInterval);
      toast.success(t('Redirecting to Stripe checkout...'));
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(t('Failed to start checkout process'));
    } finally {
      setLoading(null);
    }
    */
  };

  const handleManageSubscription = async () => {
    try {
      setLoading('manage');
      onOpenChange(false);
      navigate('/settings?tab=subscription');
      toast.success(t('Opening settings...'));
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error(t('Failed to open settings'));
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (planId: string) => {
    if (planId === 'free') {
      return subscribed ? t('Switch to Free') : t('Current Plan');
    }
    
    if (subscribed && subscription_tier === planId) {
      return t('Current Plan');
    }
    
    return t('Switch to Plan');
  };

  const plans = [
    {
      name: t('Free'),
      info: t('Basic fitness tracking'),
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { text: t('Theme: Light mode only') },
        { text: t('Food adding: Manual only') },
        { text: t('Food overview + water tracking') },
        { text: t('Custom workouts: ❌') },
        { text: t('Custom exercises: Max 5 exercises') },
        { text: t('Custom meals: ❌') },
        { text: t('Training calendar: ❌') },
        { text: t('Planned workouts: ❌') },
        { text: t('Personal records tracking: ❌') },
        { text: t('1RM calculator: ❌') },
        { text: t('Weight tracking with charts') },
        { text: t('Weight history view') },
        { text: t('Target weight setting') },
        { text: t('Body measurement tracking: View data only') },
        { text: t('Progress photos + date: ❌') },
        { text: t('Data import (time, length, weight, etc.)') },
        { text: t('BMI calculator with indication: ❌') },
        { text: t('Meal plan with macros') },
        { text: t('Settings page') },
        { text: t('AI functions (coach, planner, feedback): ❌') }
      ],
      btn: {
        text: getButtonText('free'),
        onClick: () => handleSelectPlan('free')
      },
      highlighted: false
    },
    {
      name: t('Pro'),
      info: t('Advanced fitness tracking'),
      price: {
        monthly: 4.99,
        yearly: 49.99,
      },
      features: [
        { text: t('Theme: Light + dark mode') },
        { text: t('Food adding: Manual + barcode scanner') },
        { text: t('Food overview + water tracking') },
        { text: t('Custom workouts') },
        { text: t('Custom exercises: Max 5 exercises') },
        { text: t('Custom meals: Max 2 meals') },
        { text: t('Training calendar') },
        { text: t('Planned workouts') },
        { text: t('Personal records tracking') },
        { text: t('1RM calculator') },
        { text: t('Weight tracking with charts') },
        { text: t('Weight history view') },
        { text: t('Target weight setting') },
        { text: t('Body measurement tracking: Basic chart with body measurements') },
        { text: t('Progress photos + date: Photos + date') },
        { text: t('Data import (time, length, weight, etc.)') },
        { text: t('BMI calculator with indication') },
        { text: t('Meal plan with macros') },
        { text: t('Settings page') },
        { text: t('AI functions (coach, planner, feedback): ❌') }
      ],
      btn: {
        text: loading === 'pro' ? t('Processing...') : getButtonText('pro'),
        onClick: () => handleSelectPlan('pro')
      },
      highlighted: true
    },
    {
      name: t('Premium'),
      info: t('Complete fitness solution'),
      price: {
        monthly: 7.99,
        yearly: 79.99,
      },
      features: [
        { text: t('Everything in Pro') },
        { text: t('Custom exercises: Unlimited') },
        { text: t('Custom meals: Unlimited') },
        { text: t('Body measurement tracking: Chart with body measurements') },
        { text: t('Progress photos + date: Photos + date + notes + scrollable display') },
        { text: t('AI functions (coach, planner, feedback)') }
      ],
      btn: {
        text: loading === 'premium' ? t('Processing...') : getButtonText('premium'),
        onClick: () => handleSelectPlan('premium')
      },
      highlighted: false
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-4">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              🧪 {t('Testing Mode: You can switch between plans without payment')}
            </p>
          </div>
          
          <PricingSection 
            plans={plans}
            heading={t('Choose Your Plan')}
            description={t('Unlock the full potential of your fitness journey with our premium features.')}
          />
        </div>

        {subscribed && (
          <div className="border-t px-6 py-4 bg-muted/10">
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={loading !== null}
                className="text-xs sm:text-sm"
              >
                {loading === 'manage' ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    {t('Opening...')}
                  </>
                ) : (
                  t('Manage Subscription')
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

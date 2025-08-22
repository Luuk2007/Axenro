
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
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, switchTestPlan, createCheckout } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const currentTier = test_mode ? test_subscription_tier : subscription_tier;

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free' && currentTier === 'free') return;
    
    try {
      setLoading(planId);
      
      if (test_mode) {
        // Use test plan switching
        await switchTestPlan(planId);
        toast.success(t(`Successfully switched to ${planId} plan!`));
      } else {
        // Use real Stripe checkout
        const billingInterval = 'monthly'; // Default to monthly for now
        await createCheckout(planId, billingInterval);
        toast.success(t('Redirecting to Stripe checkout...'));
      }
    } catch (error) {
      console.error('Plan selection error:', error);
      toast.error(test_mode ? t('Failed to switch plan') : t('Failed to start checkout process'));
    } finally {
      setLoading(null);
    }
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
      return currentTier === 'free' ? t('Current Plan') : (test_mode ? t('Switch to Free') : t('Downgrade'));
    }
    
    if (currentTier === planId) {
      return t('Current Plan');
    }
    
    if (test_mode) {
      return t('Select Plan (Test)');
    }
    
    if (subscribed) {
      return subscription_tier === 'pro' && planId === 'premium' ? t('Upgrade') : t('Switch Plan');
    }
    
    return t('Select Plan');
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
        { text: t('Basic fitness tracking') },
        { text: t('Limited workout history') },
        { text: t('Basic nutrition logging') }
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
        monthly: test_mode ? 0 : 4.99,
        yearly: test_mode ? 0 : 49.99,
      },
      features: [
        { text: t('Advanced fitness tracking') },
        { text: t('Unlimited workout history') },
        { text: t('Detailed nutrition analysis') },
        { text: t('Progress charts') },
        { text: t('Export data') }
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
        monthly: test_mode ? 0 : 7.99,
        yearly: test_mode ? 0 : 79.99,
      },
      features: [
        { text: t('Everything in Pro') },
        { text: t('AI-powered recommendations') },
        { text: t('Advanced analytics') },
        { text: t('Personalized meal plans') },
        { text: t('Priority support') },
        { text: t('Early access to new features') }
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
        {test_mode && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-700 font-medium">
                {t('Test Mode Active')} - {t('You can freely switch between plans without payment')}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-6 pb-4">
          <PricingSection 
            plans={plans}
            heading={test_mode ? t('Choose Your Plan (Test Version)') : t('Choose Your Plan')}
            description={test_mode 
              ? t('Experience all features in test mode. Switch between any plan to test functionality.')
              : t('Unlock the full potential of your fitness journey with our premium features.')
            }
          />
        </div>

        {subscribed && !test_mode && (
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

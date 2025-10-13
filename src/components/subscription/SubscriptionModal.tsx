
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
  const [billingFrequency, setBillingFrequency] = useState<'monthly' | 'yearly'>('monthly');

  const currentTier = test_mode ? test_subscription_tier : subscription_tier;

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentTier) return;
    
    try {
      setLoading(planId);
      
      if (test_mode) {
        // Use test plan switching
        await switchTestPlan(planId);
        toast.success(t(`Successfully switched to ${planId} plan!`));
        // Close modal after successful plan switch
        onOpenChange(false);
        // Refresh the page to ensure all UI elements update
        window.location.reload();
      } else {
        // Use real Stripe checkout with selected billing interval
        if (planId !== 'free') {
          // Map 'yearly' to 'annually' for Stripe
          const stripeInterval = billingFrequency === 'yearly' ? 'annually' : 'monthly';
          await createCheckout(planId, stripeInterval);
          toast.success(t('Redirecting to Stripe checkout...'));
        }
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
    if (currentTier === planId) {
      return t('Current Plan');
    }
    
    if (test_mode) {
      return loading === planId ? t('Switching...') : t('Select Plan');
    }
    
    if (planId === 'free') {
      return subscribed ? t('Downgrade') : t('Select Plan');
    }
    
    if (subscribed) {
      return subscription_tier === 'pro' && planId === 'premium' ? t('Upgrade') : t('Switch Plan');
    }
    
    return t('Select Plan');
  };

  const getButtonVariant = (planId: string): "default" | "outline" => {
    return currentTier === planId ? 'outline' : 'default';
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
        onClick: () => handleSelectPlan('free'),
        variant: getButtonVariant('free'),
        disabled: currentTier === 'free' || loading !== null
      },
      highlighted: false,
      isCurrentPlan: currentTier === 'free'
    },
    {
      name: t('Pro'),
      info: t('Advanced fitness tracking'),
      price: {
        monthly: 4.99,
        yearly: 49.99,
      },
      features: [
        { text: t('Advanced fitness tracking') },
        { text: t('Unlimited workout history') },
        { text: t('Detailed nutrition analysis') },
        { text: t('Progress charts') },
        { text: t('Export data') }
      ],
      btn: {
        text: getButtonText('pro'),
        onClick: () => handleSelectPlan('pro'),
        variant: getButtonVariant('pro'),
        disabled: currentTier === 'pro' || loading !== null
      },
      highlighted: true,
      isCurrentPlan: currentTier === 'pro'
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
        { text: t('AI-powered recommendations') },
        { text: t('Advanced analytics') },
        { text: t('Personalized meal plans') },
        { text: t('Priority support') },
        { text: t('Early access to new features') }
      ],
      btn: {
        text: getButtonText('premium'),
        onClick: () => handleSelectPlan('premium'),
        variant: getButtonVariant('premium'),
        disabled: currentTier === 'premium' || loading !== null
      },
      highlighted: false,
      isCurrentPlan: currentTier === 'premium'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl h-[85vh] p-0 flex flex-col overflow-hidden">
        {test_mode && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-700 font-medium">
                {t('Test Mode Active')} - {t('You can freely switch between plans without payment')}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          <PricingSection 
            plans={plans}
            heading={test_mode ? t('Choose Your Plan (Test Version)') : t('Choose Your Plan')}
            description={test_mode 
              ? t('Experience all features in test mode. Switch between any plan to test functionality.')
              : t('Unlock the full potential of your fitness journey with our premium features.')
            }
            className="p-0"
            frequency={billingFrequency}
            setFrequency={setBillingFrequency}
          />
        </div>

        {subscribed && !test_mode && (
          <div className="border-t px-6 py-4 bg-muted/10 flex-shrink-0">
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


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
  const { subscribed, subscription_tier, createCheckout } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') return;
    
    try {
      setLoading(planId);
      const billingInterval = 'monthly'; // Default to monthly for now
      await createCheckout(planId, billingInterval);
      toast.success(t('Redirecting to Stripe checkout...'));
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(t('Failed to start checkout process'));
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
      return subscribed ? t('Downgrade') : t('Current Plan');
    }
    
    if (subscribed && subscription_tier === planId) {
      return t('Current Plan');
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
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="overflow-y-auto max-h-full">
          <PricingSection 
            plans={plans}
            heading={t('Choose Your Plan')}
            description={t('Unlock the full potential of your fitness journey with our premium features.')}
          />

          {subscribed && (
            <div className="flex justify-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

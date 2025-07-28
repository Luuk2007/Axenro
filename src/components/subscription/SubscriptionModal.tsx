
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Pricing } from '@/components/ui/pricing';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { subscribed, subscription_tier, createCheckout, openCustomerPortal } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly');

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') return;
    
    try {
      setLoading(planId);
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

  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && !subscribed) return true;
    return subscribed && subscription_tier === planId;
  };

  const plans = [
    {
      name: t('FREE'),
      price: '0',
      yearlyPrice: '0',
      period: 'month',
      features: [
        t('Basic fitness tracking'),
        t('Limited workout history'),
        t('Basic nutrition logging')
      ],
      description: t('Perfect for getting started'),
      buttonText: getButtonText('free'),
      href: '#',
      isPopular: false,
      onSelect: () => handleSelectPlan('free')
    },
    {
      name: t('PRO'),
      price: '4.99',
      yearlyPrice: '49.99',
      period: 'month',
      features: [
        t('Advanced fitness tracking'),
        t('Unlimited workout history'),
        t('Detailed nutrition analysis'),
        t('Progress charts'),
        t('Export data')
      ],
      description: t('Great for serious fitness enthusiasts'),
      buttonText: loading === 'pro' ? t('Processing...') : getButtonText('pro'),
      href: '#',
      isPopular: true,
      onSelect: () => handleSelectPlan('pro')
    },
    {
      name: t('PREMIUM'),
      price: '7.99',
      yearlyPrice: '79.99',
      period: 'month',
      features: [
        t('Everything in Pro'),
        t('AI-powered recommendations'),
        t('Advanced analytics'),
        t('Personalized meal plans'),
        t('Priority support'),
        t('Early access to new features')
      ],
      description: t('For professionals and coaches'),
      buttonText: loading === 'premium' ? t('Processing...') : getButtonText('premium'),
      href: '#',
      isPopular: false,
      onSelect: () => handleSelectPlan('premium')
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">{t('Choose Your Plan')}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-base sm:text-lg">
            {t('Unlock the full potential of your fitness journey with our premium features.')}
          </DialogDescription>
        </DialogHeader>
        
        <Pricing 
          plans={plans}
          title={t('Choose Your Plan')}
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
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { PricingSection } from '@/components/ui/pricing';
import { motion } from 'framer-motion';

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
    if (planId === currentTier) return;
    
    try {
      setLoading(planId);
      
      if (test_mode) {
        await switchTestPlan(planId);
        toast.success(t(`Successfully switched to ${planId} plan!`));
        onOpenChange(false);
        window.location.reload();
      } else {
        const billingInterval = 'monthly';
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
      <DialogContent className="sm:max-w-6xl max-h-[90vh] p-0 flex flex-col overflow-hidden border-0 bg-transparent shadow-none">
        <div className="relative flex flex-col h-full glass-premium rounded-3xl overflow-hidden">
          {/* Background gradient effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          </div>

          {/* Test mode banner */}
          {test_mode && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-blue-500/20 backdrop-blur-sm border-b border-blue-500/20 px-6 py-4"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <Sparkles className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-blue-100">
                  {t('Test Mode Active')} — {t('You can freely switch between plans without payment')}
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Close button */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl glass-premium flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="relative flex-1 overflow-y-auto px-4 sm:px-8 py-8">
            <PricingSection 
              plans={plans}
              heading={test_mode ? t('Choose Your Plan (Test Version)') : t('Choose Your Plan')}
              description={test_mode 
                ? t('Experience all features in test mode. Switch between any plan to test functionality.')
                : t('Unlock the full potential of your fitness journey with our premium features.')
              }
              className="p-0"
            />
          </div>

          {/* Footer for subscribed users */}
          {subscribed && !test_mode && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative border-t border-border/50 px-6 py-5 bg-muted/5 backdrop-blur-sm"
            >
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={loading !== null}
                  className="rounded-xl h-11 px-6 glass-premium border-border/50 hover:border-primary/50"
                >
                  {loading === 'manage' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('Opening...')}
                    </>
                  ) : (
                    t('Manage Subscription')
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, Sparkles, Check, Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, switchTestPlan, createCheckout } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');

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
        const billingInterval = frequency === 'yearly' ? 'annually' : 'monthly';
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
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: t('Basic fitness tracking'),
      price: { monthly: 0, yearly: 0 },
      icon: Zap,
      gradient: 'from-slate-500 to-slate-600',
      features: [
        t('Basic fitness tracking'),
        t('Limited workout history'),
        t('Basic nutrition logging')
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: t('Advanced fitness tracking'),
      price: { monthly: test_mode ? 0 : 4.99, yearly: test_mode ? 0 : 49.99 },
      icon: Sparkles,
      gradient: 'from-primary to-primary/70',
      highlighted: true,
      features: [
        t('Advanced fitness tracking'),
        t('Unlimited workout history'),
        t('Detailed nutrition analysis'),
        t('Progress charts'),
        t('Export data')
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      description: t('Complete fitness solution'),
      price: { monthly: test_mode ? 0 : 7.99, yearly: test_mode ? 0 : 79.99 },
      icon: Crown,
      gradient: 'from-amber-500 to-orange-500',
      features: [
        t('Everything in Pro'),
        t('AI-powered recommendations'),
        t('Advanced analytics'),
        t('Personalized meal plans'),
        t('Priority support'),
        t('Early access to new features')
      ],
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton 
        className="sm:max-w-5xl max-h-[90vh] p-0 border-0 bg-card/95 backdrop-blur-xl overflow-hidden"
      >
        {/* Header with close button */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Close button */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Test mode banner */}
          {test_mode && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">
                {t('Test Mode')} — {t('Switch plans freely')}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {t('Choose Your Plan')}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t('Unlock the full potential of your fitness journey')}
            </p>
          </div>

          {/* Frequency Toggle */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex rounded-xl bg-muted/50 p-1">
              {(['monthly', 'yearly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={cn(
                    "relative px-5 py-2 text-sm font-medium rounded-lg transition-all",
                    frequency === freq 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {freq === 'monthly' ? t('Monthly') : t('Yearly')}
                  {freq === 'yearly' && (
                    <span className="ml-1.5 text-xs text-primary font-semibold">-17%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, index) => {
              const isCurrentPlan = currentTier === plan.id;
              const Icon = plan.icon;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex flex-col rounded-2xl p-5 transition-all duration-300",
                    plan.highlighted 
                      ? "bg-primary/5 border-2 border-primary/30 shadow-lg" 
                      : isCurrentPlan
                        ? "bg-green-500/5 border-2 border-green-500/30"
                        : "bg-muted/30 border border-border/50 hover:border-border"
                  )}
                >
                  {/* Badge */}
                  {(isCurrentPlan || plan.highlighted) && (
                    <div className="absolute -top-2.5 left-4">
                      <span className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-full",
                        isCurrentPlan 
                          ? "bg-green-500 text-white"
                          : "bg-primary text-primary-foreground"
                      )}>
                        {isCurrentPlan ? t('Current') : t('Popular')}
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4 mt-1">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white",
                      plan.gradient
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-muted-foreground text-xs">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    {plan.id === 'free' ? (
                      <span className="text-3xl font-bold">{t('Free')}</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">€{plan.price[frequency]}</span>
                        <span className="text-muted-foreground text-sm">
                          /{frequency === 'monthly' ? t('mo') : t('yr')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-2.5 mb-5">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={cn(
                          "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                          plan.highlighted 
                            ? "bg-primary/20 text-primary" 
                            : plan.id === 'premium'
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-muted text-muted-foreground"
                        )}>
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || loading !== null}
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    className={cn(
                      "w-full h-11 rounded-xl font-medium",
                      !isCurrentPlan && plan.highlighted && "bg-primary hover:bg-primary/90",
                      !isCurrentPlan && plan.id === 'premium' && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                    )}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      t('Current Plan')
                    ) : (
                      t('Select Plan')
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {subscribed && !test_mode && (
          <div className="border-t border-border/50 px-6 py-4 bg-muted/20">
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                onClick={handleManageSubscription}
                disabled={loading !== null}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {loading === 'manage' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t('Manage Subscription')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

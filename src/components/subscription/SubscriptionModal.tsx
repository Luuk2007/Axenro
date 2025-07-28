
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  tagline?: string;
  features: string[];
  isActive?: boolean;
  isPopular?: boolean;
}

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

  const plans: Plan[] = [
    {
      id: 'free',
      name: t('Free'),
      monthlyPrice: '€0',
      annualPrice: '€0',
      features: [t('Basic fitness tracking'), t('Limited workout history'), t('Basic nutrition logging')],
    },
    {
      id: 'pro',
      name: t('Pro'),
      monthlyPrice: '€14.99',
      annualPrice: '€149.99',
      tagline: t('Most Popular'),
      features: [
        t('Advanced fitness tracking'),
        t('Unlimited workout history'), 
        t('Detailed nutrition analysis'),
        t('Progress charts'),
        t('Export data')
      ],
      isPopular: true,
    },
    {
      id: 'premium',
      name: t('Premium'),
      monthlyPrice: '€24.99',
      annualPrice: '€249.99',
      features: [
        t('Everything in Pro'),
        t('AI-powered recommendations'),
        t('Advanced analytics'),
        t('Personalized meal plans'),
        t('Priority support'),
        t('Early access to new features')
      ],
    },
  ];

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

  const getButtonText = (plan: Plan) => {
    if (plan.id === 'free') {
      return subscribed ? t('Downgrade') : t('Current Plan');
    }
    
    if (subscribed && subscription_tier === plan.id) {
      return t('Current Plan');
    }
    
    if (subscribed) {
      return subscription_tier === 'pro' && plan.id === 'premium' ? t('Upgrade') : t('Switch Plan');
    }
    
    return t('Select Plan');
  };

  const isCurrentPlan = (plan: Plan) => {
    if (plan.id === 'free' && !subscribed) return true;
    return subscribed && subscription_tier === plan.id;
  };

  const isDisabled = (plan: Plan) => {
    return isCurrentPlan(plan) || loading !== null;
  };

  const getCurrentPrice = (plan: Plan) => {
    return billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavingsText = () => {
    return billingInterval === 'annually' ? t('Save 20%') : '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">{t('Choose Your Plan')}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-base sm:text-lg">
            {t('Unlock the full potential of your fitness journey with our premium features.')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-4 mb-6">
          <Tabs value={billingInterval} onValueChange={(value) => setBillingInterval(value as 'monthly' | 'annually')}>
            <TabsList className="grid w-full grid-cols-2 max-w-sm">
              <TabsTrigger value="monthly">{t('Monthly')}</TabsTrigger>
              <TabsTrigger value="annually" className="relative">
                {t('Annual')}
                {getSavingsText() && (
                  <Badge className="ml-2 text-xs bg-green-100 text-green-800">
                    {getSavingsText()}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.isPopular ? 'border-primary shadow-md sm:scale-105' : ''
              } ${isCurrentPlan(plan) ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.tagline && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {plan.tagline}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-3 sm:pb-4 p-3 sm:p-6">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <CardTitle className="text-lg sm:text-2xl font-bold">{plan.name}</CardTitle>
                  {isCurrentPlan(plan) && (
                    <Badge variant="secondary" className="text-xs">
                      {t('Active')}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {getCurrentPrice(plan)}
                  {plan.id !== 'free' && (
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                      /{billingInterval === 'monthly' ? t('per month') : t('per year')}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full text-xs sm:text-sm py-2 sm:py-2.5" 
                  variant={isCurrentPlan(plan) ? "secondary" : "default"}
                  disabled={isDisabled(plan)}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      {t('Processing...')}
                    </>
                  ) : (
                    getButtonText(plan)
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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

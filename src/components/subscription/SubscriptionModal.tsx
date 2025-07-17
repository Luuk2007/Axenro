
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
import { Check, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: string;
  tagline?: string;
  features: string[];
  isActive?: boolean;
  isPopular?: boolean;
}

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    features: ['Basic fitness tracking', 'Limited workout history', 'Basic nutrition logging'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€4.99',
    tagline: 'Most Popular',
    features: [
      'Advanced fitness tracking',
      'Unlimited workout history', 
      'Detailed nutrition analysis',
      'Progress charts',
      'Export data'
    ],
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€7.99',
    features: [
      'Everything in Pro',
      'AI-powered recommendations',
      'Advanced analytics',
      'Personalized meal plans',
      'Priority support',
      'Early access to new features'
    ],
  },
];

export default function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const { subscribed, subscription_tier, createCheckout, openCustomerPortal } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') return;
    
    try {
      setLoading(planId);
      await createCheckout(planId);
      toast.success('Redirecting to Stripe checkout...');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading('manage');
      await openCustomerPortal();
      toast.success('Opening customer portal...');
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open customer portal');
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (plan: Plan) => {
    if (plan.id === 'free') {
      return subscribed ? 'Downgrade' : 'Current Plan';
    }
    
    if (subscribed && subscription_tier === plan.name) {
      return 'Current Plan';
    }
    
    if (subscribed) {
      return subscription_tier === 'Pro' && plan.id === 'premium' ? 'Upgrade' : 'Switch Plan';
    }
    
    return 'Select Plan';
  };

  const isCurrentPlan = (plan: Plan) => {
    if (plan.id === 'free' && !subscribed) return true;
    return subscribed && subscription_tier === plan.name;
  };

  const isDisabled = (plan: Plan) => {
    return isCurrentPlan(plan) || loading !== null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-lg">
            Unlock the full potential of your fitness journey with our premium features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.isPopular ? 'border-primary shadow-md scale-105' : ''
              } ${isCurrentPlan(plan) ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.tagline && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {plan.tagline}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  {isCurrentPlan(plan) && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}
                  {plan.id !== 'free' && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan(plan) ? "secondary" : "default"}
                  disabled={isDisabled(plan)}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
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
          <div className="flex justify-center mt-6 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleManageSubscription}
              disabled={loading !== null}
            >
              {loading === 'manage' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

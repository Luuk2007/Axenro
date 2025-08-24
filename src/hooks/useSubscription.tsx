
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  test_mode: boolean;
  test_subscription_tier: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    test_mode: true,
    test_subscription_tier: 'free',
  });
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  const checkSubscription = async () => {
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      const newSubscriptionData = {
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        test_mode: data.test_mode ?? true,
        test_subscription_tier: data.test_subscription_tier || 'free',
      };

      setSubscriptionData(newSubscriptionData);
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTestPlan = async (planId: string) => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    console.log('Switching to plan:', planId);

    try {
      // Optimistically update the local state first
      const newSubscriptionData = {
        subscribed: planId !== 'free',
        subscription_tier: planId === 'free' ? null : planId,
        subscription_end: planId === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        test_mode: true,
        test_subscription_tier: planId,
      };

      setSubscriptionData(newSubscriptionData);

      const { data, error } = await supabase.functions.invoke('switch-test-plan', {
        body: { planId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Switch plan error details:', error);
        // Revert optimistic update on error
        await checkSubscription();
        throw new Error(error.message || 'Failed to switch plan');
      }

      console.log('Plan switch successful:', data);

      // Update with server response
      const finalSubscriptionData = {
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        test_mode: true,
        test_subscription_tier: data.test_subscription_tier,
      };

      setSubscriptionData(finalSubscriptionData);
      return data;
    } catch (error) {
      console.error('Error switching test plan:', error);
      // Ensure we revert to the correct state on any error
      await checkSubscription();
      throw error;
    }
  };

  const createCheckout = async (planId: string, billingInterval: 'monthly' | 'annually') => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, billingInterval },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    ...subscriptionData,
    loading,
    checkSubscription,
    switchTestPlan,
    createCheckout,
    openCustomerPortal,
  };
};

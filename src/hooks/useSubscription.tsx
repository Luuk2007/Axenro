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

const STORAGE_KEY_PREFIX = 'subscriptionData:';

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    test_mode: true,
    test_subscription_tier: 'free',
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
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
      try {
        if (user?.id) {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(newSubscriptionData));
        }
      } catch (e) {
        console.warn('Failed to cache subscription data', e);
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const switchTestPlan = async (planId: string) => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('switch-test-plan', {
        body: { planId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      // Update local state immediately for all components using this hook
      const newSubscriptionData = {
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        test_mode: true,
        test_subscription_tier: data.test_subscription_tier,
      };

      setSubscriptionData(newSubscriptionData);
      try {
        if (user?.id) {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(newSubscriptionData));
        }
      } catch (e) {
        console.warn('Failed to cache subscription data', e);
      }

      // Also trigger a fresh check from the server to ensure consistency
      await checkSubscription();

      return data;
    } catch (error) {
      console.error('Error switching test plan:', error);
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
    if (!user) {
      setInitialized(true);
      setLoading(false);
      return;
    }

    // Try to read cached subscription data synchronously for instant, stable UI
    try {
      const cachedRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${user.id}`);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as SubscriptionData;
        setSubscriptionData(cached);
        setInitialized(true);
      } else {
        setInitialized(false);
      }
    } catch (e) {
      console.warn('Failed to load cached subscription data', e);
    }

    checkSubscription();
  }, [user?.id, session]);

  return {
    ...subscriptionData,
    loading,
    initialized,
    checkSubscription,
    switchTestPlan,
    createCheckout,
    openCustomerPortal,
  };
};

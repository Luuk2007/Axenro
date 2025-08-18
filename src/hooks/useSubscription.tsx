
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
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
      
      // Check for locally stored test subscription first
      const testSubscription = localStorage.getItem('testSubscription');
      if (testSubscription) {
        const testData = JSON.parse(testSubscription);
        setSubscriptionData(testData);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscriptionData({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      });
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
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

  // Test function to switch subscription tiers locally
  const switchToTestTier = (tier: 'free' | 'pro' | 'premium') => {
    const testData: SubscriptionData = {
      subscribed: tier !== 'free',
      subscription_tier: tier === 'free' ? null : tier,
      subscription_end: tier !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
    };
    
    if (tier === 'free') {
      localStorage.removeItem('testSubscription');
    } else {
      localStorage.setItem('testSubscription', JSON.stringify(testData));
    }
    
    // Immediately update the state
    setSubscriptionData(testData);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('subscriptionChanged', { detail: testData }));
  };

  // Listen for subscription changes from other components
  useEffect(() => {
    const handleSubscriptionChange = (event: CustomEvent) => {
      setSubscriptionData(event.detail);
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange as EventListener);
    
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange as EventListener);
    };
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    ...subscriptionData,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    switchToTestTier, // Expose test function
  };
};

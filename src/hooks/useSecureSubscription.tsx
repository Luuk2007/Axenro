
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logSecurityEvent } from '@/utils/security';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSecureSubscription = () => {
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
      
      // Log subscription check attempt
      logSecurityEvent('SUBSCRIPTION_CHECK_ATTEMPT', { userId: user.id });
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        logSecurityEvent('SUBSCRIPTION_CHECK_ERROR', { 
          userId: user.id, 
          error: error.message 
        });
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscriptionData({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      });
      
      // Log successful subscription check
      logSecurityEvent('SUBSCRIPTION_CHECK_SUCCESS', { 
        userId: user.id, 
        subscribed: data.subscribed,
        tier: data.subscription_tier 
      });
      
    } catch (error) {
      logSecurityEvent('SUBSCRIPTION_CHECK_EXCEPTION', { 
        userId: user.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (planId: string) => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    try {
      // Log checkout attempt
      logSecurityEvent('CHECKOUT_ATTEMPT', { userId: user.id, planId });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        logSecurityEvent('CHECKOUT_ERROR', { 
          userId: user.id, 
          planId, 
          error: error.message 
        });
        throw error;
      }

      // Log successful checkout creation
      logSecurityEvent('CHECKOUT_SUCCESS', { userId: user.id, planId });
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      logSecurityEvent('CHECKOUT_EXCEPTION', { 
        userId: user.id, 
        planId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    try {
      // Log portal access attempt
      logSecurityEvent('PORTAL_ACCESS_ATTEMPT', { userId: user.id });
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        logSecurityEvent('PORTAL_ACCESS_ERROR', { 
          userId: user.id, 
          error: error.message 
        });
        throw error;
      }

      // Log successful portal access
      logSecurityEvent('PORTAL_ACCESS_SUCCESS', { userId: user.id });
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      logSecurityEvent('PORTAL_ACCESS_EXCEPTION', { 
        userId: user.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
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
    createCheckout,
    openCustomerPortal,
  };
};

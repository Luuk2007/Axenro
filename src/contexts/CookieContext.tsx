
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  consentGiven: boolean;
  timestamp?: string;
}

interface CookieContextType {
  consent: CookieConsent;
  showConsentModal: boolean;
  updateConsent: (newConsent: Partial<CookieConsent>) => Promise<void>;
  acceptAllCookies: () => Promise<void>;
  rejectAllCookies: () => Promise<void>;
  hideConsentModal: () => void;
  showConsentModalForPreferences: () => void;
  checkConsentStatus: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const defaultConsent: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  consentGiven: false,
};

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Check if user has given consent
  const checkConsentStatus = async () => {
    // If we're on the cookie preferences page, always show the modal
    if (window.location.pathname === '/cookiepreferences') {
      setShowConsentModal(true);
      return;
    }

    if (!user) {
      // For non-authenticated users, check localStorage
      const localConsent = localStorage.getItem('cookieConsent');
      if (localConsent) {
        const parsedConsent = JSON.parse(localConsent);
        setConsent(parsedConsent);
        setShowConsentModal(!parsedConsent.consentGiven);
      } else {
        setShowConsentModal(true);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cookie_consent')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching cookie consent:', error);
        setShowConsentModal(true);
        return;
      }

      if (data && data.length > 0) {
        const dbConsent = data[0];
        const consentData: CookieConsent = {
          essential: dbConsent.essential_cookies,
          analytics: dbConsent.analytics_cookies,
          marketing: dbConsent.marketing_cookies,
          consentGiven: true,
          timestamp: dbConsent.updated_at,
        };
        setConsent(consentData);
        setShowConsentModal(false);
      } else {
        setShowConsentModal(true);
      }
    } catch (error) {
      console.error('Error checking consent status:', error);
      setShowConsentModal(true);
    }
  };

  const updateConsent = async (newConsent: Partial<CookieConsent>) => {
    const updatedConsent = { ...consent, ...newConsent, consentGiven: true };
    setConsent(updatedConsent);

    if (user) {
      try {
        const { error } = await supabase
          .from('cookie_consent')
          .upsert({
            user_id: user.id,
            essential_cookies: updatedConsent.essential,
            analytics_cookies: updatedConsent.analytics,
            marketing_cookies: updatedConsent.marketing,
          });

        if (error) {
          console.error('Error saving cookie consent:', error);
          toast.error('Failed to save cookie preferences');
          return;
        }
      } catch (error) {
        console.error('Error updating consent:', error);
        toast.error('Failed to save cookie preferences');
        return;
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('cookieConsent', JSON.stringify(updatedConsent));
    }

    // Handle cookie setting/removal based on consent
    handleCookieManagement(updatedConsent);
    setShowConsentModal(false);
    
    // If we're on the cookie preferences page, navigate back to home
    if (window.location.pathname === '/cookiepreferences') {
      window.history.pushState({}, '', '/');
    }
  };

  const acceptAllCookies = async () => {
    await updateConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAllCookies = async () => {
    await updateConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  const hideConsentModal = () => {
    setShowConsentModal(false);
    // If we're on the cookie preferences page, navigate back to home
    if (window.location.pathname === '/cookiepreferences') {
      window.history.pushState({}, '', '/');
    }
  };

  const showConsentModalForPreferences = () => {
    setShowConsentModal(true);
  };

  const handleCookieManagement = (consentData: CookieConsent) => {
    // Remove analytics cookies if consent withdrawn
    if (!consentData.analytics) {
      // Remove Google Analytics cookies
      document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = '_ga_*=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Remove marketing cookies if consent withdrawn
    if (!consentData.marketing) {
      // Remove marketing tracking cookies
      document.cookie = '_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = '_fbc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Essential cookies are always allowed and include authentication, preferences, etc.
  };

  useEffect(() => {
    checkConsentStatus();
  }, [user]);

  const value = {
    consent,
    showConsentModal,
    updateConsent,
    acceptAllCookies,
    rejectAllCookies,
    hideConsentModal,
    showConsentModalForPreferences,
    checkConsentStatus,
  };

  return (
    <CookieContext.Provider value={value}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}

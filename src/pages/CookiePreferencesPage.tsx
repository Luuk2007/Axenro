
import { useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieContext';
import { useNavigate } from 'react-router-dom';
import CookieConsentModal from '@/components/cookies/CookieConsentModal';

const CookiePreferencesPage = () => {
  const { showConsentModal, checkConsentStatus } = useCookieConsent();
  const navigate = useNavigate();

  useEffect(() => {
    // Force show the cookie consent modal when accessing this page
    checkConsentStatus();
    
    // If modal is not showing, redirect to home
    if (!showConsentModal) {
      // Small delay to allow context to update
      setTimeout(() => {
        if (!showConsentModal) {
          navigate('/');
        }
      }, 100);
    }
  }, [showConsentModal, navigate, checkConsentStatus]);

  // Return empty div - the modal will be rendered by the CookieConsentModal component
  return <div />;
};

export default CookiePreferencesPage;

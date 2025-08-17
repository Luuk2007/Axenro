
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCookieConsent } from '@/contexts/CookieContext';
import { Shield, BarChart3, Target, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const CookiePreferencesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    consent,
    updateConsent,
    acceptAllCookies, 
    rejectAllCookies
  } = useCookieConsent();
  
  const [customConsent, setCustomConsent] = useState({
    essential: consent.essential,
    analytics: consent.analytics,
    marketing: consent.marketing,
  });

  const handleSaveCustom = async () => {
    await updateConsent(customConsent);
    navigate(-1); // Go back to previous page
  };

  const handleAcceptAll = async () => {
    await acceptAllCookies();
    navigate(-1);
  };

  const handleRejectAll = async () => {
    await rejectAllCookies();
    navigate(-1);
  };

  const handleSwitchChange = (type: 'analytics' | 'marketing', value: boolean) => {
    setCustomConsent(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const formatConsentDate = () => {
    if (!consent.timestamp) return t('notSet');
    return new Date(consent.timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('Back')}
          </Button>
          <h1 className="text-2xl font-semibold">{t('Cookie preferences')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('We use cookies to improve your experience, analyze site traffic, and personalize content')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="font-medium">{t('Last updated')}: </span>
            {formatConsentDate()}
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-green-600" />
                {t('Essential cookies')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {t('These cookies are required for the website to function properly and cannot be disabled')}
              </p>
              <div className="flex items-center justify-between">
                <Label htmlFor="essential">{t('Always active')}</Label>
                <Switch id="essential" checked disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                {t('Analytics cookies')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {t('These cookies help us understand how visitors interact with the website, so we can improve performance and user experience')}
              </p>
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">{t('Enable analytics')}</Label>
                <Switch 
                  id="analytics" 
                  checked={customConsent.analytics}
                  onCheckedChange={(checked) => handleSwitchChange('analytics', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-purple-600" />
                {t('Marketing cookies')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {t('These cookies are used to deliver relevant ads and measure the effectiveness of our marketing campaigns')}
              </p>
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing">{t('Enable marketing')}</Label>
                <Switch 
                  id="marketing" 
                  checked={customConsent.marketing}
                  onCheckedChange={(checked) => handleSwitchChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button onClick={handleAcceptAll} className="w-full sm:w-auto">
                {t('Accept all cookies')}
              </Button>
              <Button onClick={handleRejectAll} variant="outline" className="w-full sm:w-auto">
                {t('Reject all cookies')}
              </Button>
            </div>
            <Button onClick={handleSaveCustom} variant="default" className="w-full sm:w-auto">
              {t('Save preferences')}
            </Button>
          </div>

          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>
              {t('For more information, please see our')}{' '}
              <Link to="/privacypolicy" className="text-primary underline hover:no-underline">
                {t('privacy policy')}
              </Link>{' '}
              {t('and')}{' '}
              <Link to="/termsandconditions" className="text-primary underline hover:no-underline">
                {t('terms & conditions')}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferencesPage;

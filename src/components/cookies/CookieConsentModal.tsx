
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCookieConsent } from '@/contexts/CookieContext';
import { Cookie, Shield, BarChart3, Target } from 'lucide-react';

const CookieConsentModal = () => {
  const { t } = useLanguage();
  const { 
    showConsentModal, 
    acceptAllCookies, 
    rejectAllCookies, 
    updateConsent,
    hideConsentModal 
  } = useCookieConsent();
  
  const [showCustomization, setShowCustomization] = useState(false);
  const [customConsent, setCustomConsent] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const handleCustomizeClick = () => {
    setShowCustomization(true);
  };

  const handleSaveCustom = async () => {
    await updateConsent(customConsent);
  };

  const handleSwitchChange = (type: 'analytics' | 'marketing', value: boolean) => {
    setCustomConsent(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  if (!showConsentModal) return null;

  return (
    <Dialog open={showConsentModal} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cookie className="h-5 w-5" />
            {t('cookieConsentTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('cookieConsentDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm">
            {t('cookieExplanation')}
          </p>

          {!showCustomization ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      {t('essentialCookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('essentialCookiesDescription')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="essential">{t('alwaysActive')}</Label>
                      <Switch id="essential" checked disabled />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4" />
                      {t('analyticsCookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('analyticsCookiesDescription')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="h-4 w-4" />
                      {t('marketingCookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('marketingCookiesDescription')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button onClick={acceptAllCookies} className="w-full sm:w-auto">
                    {t('acceptAllCookies')}
                  </Button>
                  <Button onClick={rejectAllCookies} variant="outline" className="w-full sm:w-auto">
                    {t('rejectAllCookies')}
                  </Button>
                </div>
                <Button onClick={handleCustomizeClick} variant="ghost" className="w-full sm:w-auto">
                  {t('customizeCookies')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      {t('essentialCookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('essentialCookiesDescription')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="essential-custom">{t('alwaysActive')}</Label>
                      <Switch id="essential-custom" checked disabled />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4" />
                      {t('analyticsCookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('analyticsCookiesDescription')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-custom">{t('enableAnalytics')}</Label>
                      <Switch 
                        id="analytics-custom" 
                        checked={customConsent.analytics}
                        onCheckedChange={(checked) => handleSwitchChange('analytics', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="h-4 w-4" />
                      {t('marketingCookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('marketingCookiesDescription')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing-custom">{t('enableMarketing')}</Label>
                      <Switch 
                        id="marketing-custom" 
                        checked={customConsent.marketing}
                        onCheckedChange={(checked) => handleSwitchChange('marketing', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button onClick={handleSaveCustom} className="w-full sm:w-auto">
                  {t('savePreferences')}
                </Button>
                <Button onClick={() => setShowCustomization(false)} variant="outline" className="w-full sm:w-auto">
                  {t('back')}
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>
              {t('cookiePolicyText')}{' '}
              <Link to="/privacypolicy" className="text-primary underline hover:no-underline">
                {t('privacyPolicy')}
              </Link>{' '}
              {t('and')}{' '}
              <Link to="/termsandconditions" className="text-primary underline hover:no-underline">
                {t('cookiePolicy')}
              </Link>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentModal;

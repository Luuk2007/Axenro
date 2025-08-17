
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCookieConsent } from '@/contexts/CookieContext';
import { Cookie, Shield, BarChart3, Target, ExternalLink } from 'lucide-react';

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
            {t('Cookie preferences')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('We use cookies to improve your experience, analyze site traffic, and personalize content')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm">
            {t('You can choose which types of cookies you allow. Essential cookies are always active')}
          </p>

          {!showCustomization ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      {t('Essential cookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
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
                      <BarChart3 className="h-4 w-4" />
                      {t('Analytics cookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('These cookies help us understand how visitors interact with the website, so we can improve performance and user experience')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="h-4 w-4" />
                      {t('Marketing cookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('These cookies are used to deliver relevant ads and measure the effectiveness of our marketing campaigns')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button onClick={acceptAllCookies} className="w-full sm:w-auto">
                    {t('Accept all cookies')}
                  </Button>
                  <Button onClick={rejectAllCookies} variant="outline" className="w-full sm:w-auto">
                    {t('Reject all cookies')}
                  </Button>
                </div>
                <Button onClick={handleCustomizeClick} variant="ghost" className="w-full sm:w-auto">
                  {t('Customize')}
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
                      {t('Essential cookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('These cookies are required for the website to function properly and cannot be disabled')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="essential-custom">{t('Always active')}</Label>
                      <Switch id="essential-custom" checked disabled />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4" />
                      {t('Analytics cookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('These cookies help us understand how visitors interact with the website, so we can improve performance and user experience')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-custom">{t('Enable analytics')}</Label>
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
                      {t('Marketing cookies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('These cookies are used to deliver relevant ads and measure the effectiveness of our marketing campaigns')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing-custom">{t('Enable marketing')}</Label>
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
                  {t('Save preferences')}
                </Button>
                <Button onClick={() => setShowCustomization(false)} variant="outline" className="w-full sm:w-auto">
                  {t('Back')}
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>
              {t('For more information, please see our')}{' '}
              <Link to="/privacypolicy" className="text-primary underline hover:no-underline">
                {t('privacy policy')}
              </Link>{' '}
              {t('and')}{' '}
              <Link to="/termsandconditions" className="text-primary underline hover:no-underline">
                {t('terms & conditions')}
              </Link>.{' '}
              <Link to="/cookie-preferences" className="text-primary underline hover:no-underline inline-flex items-center gap-1">
                {t('Manage cookie preferences')}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentModal;

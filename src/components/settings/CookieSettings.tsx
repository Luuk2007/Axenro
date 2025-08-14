
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Cookie, Shield, BarChart3, Target } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCookieConsent } from '@/contexts/CookieContext';
import { toast } from 'sonner';

const CookieSettings = () => {
  const { t } = useLanguage();
  const { consent, updateConsent } = useCookieConsent();
  const [isOpen, setIsOpen] = useState(false);
  const [localConsent, setLocalConsent] = useState({
    essential: consent.essential,
    analytics: consent.analytics,
    marketing: consent.marketing,
  });

  const handleSwitchChange = (type: 'analytics' | 'marketing', value: boolean) => {
    setLocalConsent(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSavePreferences = async () => {
    await updateConsent(localConsent);
    toast.success(t('Cookie preferences saved'));
  };

  const formatConsentDate = () => {
    if (!consent.timestamp) return t('notSet');
    return new Date(consent.timestamp).toLocaleDateString();
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cookie className="h-4 w-4" />
                {t('Cookie preferences')}
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 py-3">
            <div className="text-sm text-muted-foreground">
              <p>{t('')}</p>
              <p className="mt-2">
                <span className="font-medium">{t('Last updated')}: </span>
                {formatConsentDate()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-green-600" />
                  <div>
                    <Label className="text-sm font-medium">{t('Essential cookies')}</Label>
                    <p className="text-xs text-muted-foreground">{t('Essential cookies short')}</p>
                  </div>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium">{t('Analytics cookies')}</Label>
                    <p className="text-xs text-muted-foreground">{t('Analytics cookies short')}</p>
                  </div>
                </div>
                <Switch 
                  checked={localConsent.analytics}
                  onCheckedChange={(checked) => handleSwitchChange('analytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-purple-600" />
                  <div>
                    <Label className="text-sm font-medium">{t('Marketing cookies')}</Label>
                    <p className="text-xs text-muted-foreground">{t('Marketing cookies short')}</p>
                  </div>
                </div>
                <Switch 
                  checked={localConsent.marketing}
                  onCheckedChange={(checked) => handleSwitchChange('marketing', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSavePreferences}>
                {t('Save preferences')}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CookieSettings;

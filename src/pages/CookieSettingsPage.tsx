
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import CookieSettings from '@/components/settings/CookieSettings';

const CookieSettingsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
          
          <h1 className="text-3xl font-bold">{t('cookiePreferences')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('cookieSettingsDescription')}
          </p>
        </div>

        <CookieSettings />
      </div>
    </div>
  );
};

export default CookieSettingsPage;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Sparkles } from 'lucide-react';
import { useFeatureAccess, type FeatureName } from '@/hooks/useFeatureAccess';
import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionModal from './SubscriptionModal';

interface UpgradePromptProps {
  feature: FeatureName;
  compact?: boolean;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, compact = false }) => {
  const { getUpgradeMessage } = useFeatureAccess();
  const { t } = useLanguage();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const upgradeMessage = getUpgradeMessage(feature);

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">{t('Premium Feature')}</span>
        </div>
        <SubscriptionModal 
          open={showSubscriptionModal} 
          onOpenChange={setShowSubscriptionModal} 
        />
      </>
    );
  }

  return (
    <>
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">{t('Premium Feature')}</h3>
            <p className="text-sm text-muted-foreground">
              {t(upgradeMessage)}
            </p>
          </div>
          <Button 
            onClick={() => setShowSubscriptionModal(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t('Upgrade Now')}
          </Button>
        </div>
      </Card>
      <SubscriptionModal 
        open={showSubscriptionModal} 
        onOpenChange={setShowSubscriptionModal} 
      />
    </>
  );
};

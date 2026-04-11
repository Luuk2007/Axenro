import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Crown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { useSubscription } from '@/hooks/useSubscription';
import { useMeasurementTypes } from '@/hooks/useMeasurementTypes';
import { getSubscriptionLimits, formatUsageText, canAddMore } from '@/utils/subscriptionLimits';

interface Props {
  embedded?: boolean;
}

const BodyMeasurementsSettings: React.FC<Props> = ({ embedded }) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, loading } = useSubscription();
  const { 
    measurementTypes, 
    updateMeasurementType, 
    addCustomMeasurementType, 
    deleteMeasurementType,
    loading: measurementTypesLoading 
  } = useMeasurementTypes();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMeasurementName, setNewMeasurementName] = useState('');
  const [newMeasurementUnit, setNewMeasurementUnit] = useState('cm');

  // Get subscription limits
  const limits = getSubscriptionLimits(subscribed, subscription_tier, test_mode, test_subscription_tier);
  const customMeasurementsCount = measurementTypes.filter(m => m.isCustom).length;
  const canAddMoreMeasurements = canAddMore(customMeasurementsCount, limits.customMeasurements);
  const usageText = formatUsageText(customMeasurementsCount, limits.customMeasurements);

  const handleToggleMeasurement = async (id: string, enabled: boolean) => {
    await updateMeasurementType(id, { enabled });
    // Dispatch event to notify Progress page about changes
    window.dispatchEvent(new CustomEvent('measurementTypesChanged'));
    toast.success(t('Settings saved'));
  };

  const handleAddCustomMeasurement = async () => {
    if (!newMeasurementName.trim()) {
      toast.error(t('pleaseEnterValue'));
      return;
    }

    // Check subscription limit
    if (!canAddMoreMeasurements) {
      toast.error(t("You've reached your custom measurements limit. Upgrade to add more."));
      return;
    }

    const result = await addCustomMeasurementType({
      measurementId: `custom_${Date.now()}`,
      name: newMeasurementName.trim(),
      unit: newMeasurementUnit,
      enabled: true,
      isCustom: true
    });

    if (result) {
      setNewMeasurementName('');
      setNewMeasurementUnit('cm');
      setShowAddDialog(false);
      window.dispatchEvent(new CustomEvent('measurementTypesChanged'));
      toast.success(t('measurementAdded'));
    }
  };

  const handleDeleteCustomMeasurement = async (id: string) => {
    await deleteMeasurementType(id);
    window.dispatchEvent(new CustomEvent('measurementTypesChanged'));
    toast.success(t('measurementDeleted'));
  };

  // Get display unit based on measurement system
  const getDisplayUnit = (baseUnit: string) => {
    if (baseUnit === 'cm' && measurementSystem === 'imperial') {
      return 'in';
    }
    return baseUnit;
  };

  // Get display name for measurement
  const getDisplayName = (measurement: { name: string; isCustom: boolean; measurementId: string }) => {
    if (measurement.isCustom) {
      return measurement.name;
    }
    return t(measurement.measurementId) || measurement.name;
  };

  const showUpgradePrompt = !canAddMoreMeasurements && limits.customMeasurements !== -1;

  const bodyContent = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("Choose which body measurements to track in your progress")}
      </p>
      
      <div className="space-y-3">
        {measurementTypes.map((measurement) => (
          <div key={measurement.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Label htmlFor={measurement.id} className="font-medium">
                {getDisplayName(measurement)}
              </Label>
              <span className="text-sm text-muted-foreground">({getDisplayUnit(measurement.unit)})</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={measurement.id}
                checked={measurement.enabled}
                onCheckedChange={(enabled) => handleToggleMeasurement(measurement.id, enabled)}
              />
              {measurement.isCustom && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteCustomMeasurement(measurement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        {showUpgradePrompt && (
          <div className="p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 rounded-xl mb-3">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">{t("Upgrade to add more custom measurements")}</span>
            </div>
          </div>
        )}
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full rounded-xl" disabled={!canAddMoreMeasurements || loading || measurementTypesLoading}>
              <Plus className="mr-2 h-4 w-4" />
              {t("Add Custom Measurement")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Add Custom Measurement")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="measurement-name">{t("Measurement Name")}</Label>
                <Input
                  id="measurement-name"
                  value={newMeasurementName}
                  onChange={(e) => setNewMeasurementName(e.target.value)}
                  placeholder={t("Enter measurement name")}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="measurement-unit">{t("Unit")}</Label>
                <select
                  id="measurement-unit"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2"
                  value={newMeasurementUnit}
                  onChange={(e) => setNewMeasurementUnit(e.target.value)}
                >
                  <option value="cm">cm</option>
                  <option value="%">%</option>
                  <option value="mm">mm</option>
                  <option value="in">in</option>
                </select>
              </div>
              <Button onClick={handleAddCustomMeasurement} className="w-full rounded-xl">
                {t("add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  if (embedded) return bodyContent;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{t("Body Measurements")}</CardTitle>
                <span className="text-sm text-muted-foreground">{usageText}</span>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 py-3">
            {bodyContent}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default BodyMeasurementsSettings;

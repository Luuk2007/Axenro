
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMeasurementSystem, MeasurementSystem } from '@/hooks/useMeasurementSystem';

interface Props {
  embedded?: boolean;
}

const MeasurementSystemSettings: React.FC<Props> = ({ embedded }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { measurementSystem, updateMeasurementSystem, loading } = useMeasurementSystem();

  const handleSystemChange = (newSystem: MeasurementSystem) => {
    updateMeasurementSystem(newSystem);
  };

  const content = (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>{t("Measurement system")}</Label>
        <Select
          value={measurementSystem}
          onValueChange={(value) => handleSystemChange(value as MeasurementSystem)}
          disabled={loading}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder={t("Select system")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric">{t("Metric")} (kg, cm)</SelectItem>
            <SelectItem value="imperial">{t("Imperial")} (lbs, inches)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("This affects how weights and measurements are displayed throughout the app")}
      </p>
    </div>
  );

  if (embedded) return content;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("Measurement system")}</CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 py-3">
            {content}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MeasurementSystemSettings;

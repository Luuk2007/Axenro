
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMeasurementSystem, MeasurementSystem } from '@/hooks/useMeasurementSystem';

const MeasurementSystemSettings = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { measurementSystem, updateMeasurementSystem, loading } = useMeasurementSystem();

  const handleSystemChange = (newSystem: MeasurementSystem) => {
    updateMeasurementSystem(newSystem);
  };

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
            <p className="text-sm text-muted-foreground">
              {t("Choose measurement system")}
            </p>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="measurement-system">{t("system")}</Label>
              <Select
                value={measurementSystem}
                onValueChange={handleSystemChange}
                disabled={loading}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("selectSystem")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">
                    {t("metric")} (cm, kg, km)
                  </SelectItem>
                  <SelectItem value="imperial">
                    {t("imperial")} (in, lbs, mi)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              <p>{t("")}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MeasurementSystemSettings;

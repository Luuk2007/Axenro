
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Dumbbell } from 'lucide-react';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { convertWeight, getWeightUnit, formatWeight } from '@/utils/unitConversions';

interface OneRepMaxCalculatorProps {
  onCalculate?: (weight: number) => void;
}

const OneRepMaxCalculator = ({ onCalculate }: OneRepMaxCalculatorProps) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  
  // Calculate 1RM using Epley formula
  const calculateOneRM = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseFloat(reps);
    
    if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum < 1) return;
    
    // Convert weight to metric for calculation
    const metricWeight = convertWeight(weightNum, measurementSystem, 'metric');
    
    // Epley formula: 1RM = weight × (1 + 0.0333 × reps)
    const oneRMMetric = metricWeight * (1 + 0.0333 * repsNum);
    
    // Convert result back to user's preferred system
    const oneRMDisplay = convertWeight(oneRMMetric, 'metric', measurementSystem);
    const roundedResult = Math.round(oneRMDisplay * 10) / 10;
    setResult(roundedResult);
    
    // Call the callback if provided (pass metric value for storage)
    if (onCalculate) {
      onCalculate(oneRMMetric);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          {t("oneRepMaxCalculator")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{t("weight")} ({getWeightUnit(measurementSystem)})</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reps">{t("reps")}</Label>
              <Input
                id="reps"
                type="number"
                min="1"
                max="36"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
          </div>
          
          <Button 
            onClick={calculateOneRM} 
            className="w-full mt-4"
            disabled={weight === '' || reps === '' || parseFloat(weight) <= 0 || parseFloat(reps) < 1}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {t("calculate")}
          </Button>
          
          {result !== null && (
            <div className="mt-4 p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">{t("Estimated One Rep Max")}</p>
              <p className="text-2xl font-bold">{formatWeight(result, measurementSystem)} {getWeightUnit(measurementSystem)}</p>
              <p className="text-xs text-muted-foreground mt-1">Using Epley Formula</p>
            </div>
          )}
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>{t("oneRepMaxDisclaimer")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OneRepMaxCalculator;

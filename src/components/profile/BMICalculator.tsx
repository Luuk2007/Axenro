
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  convertWeight, 
  convertHeight, 
  getWeightUnit, 
  getHeightUnit, 
  formatWeight, 
  formatHeight 
} from '@/utils/unitConversions';

interface BMICalculatorProps {
  initialWeight?: number; // Always passed in metric (kg)
  initialHeight?: number; // Always passed in metric (cm)
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ initialWeight, initialHeight }) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmi, setBMI] = useState<number | null>(null);
  const [weightDifference, setWeightDifference] = useState<number | null>(null);

  const weightUnit = getWeightUnit(measurementSystem);
  const heightUnit = getHeightUnit(measurementSystem);

  // Update BMI calculator values when the props change (sync with form) or measurement system changes
  useEffect(() => {
    if (initialWeight && initialWeight > 0) {
      const displayWeight = convertWeight(initialWeight, 'metric', measurementSystem);
      setWeight(formatWeight(displayWeight, measurementSystem));
    }
    if (initialHeight && initialHeight > 0) {
      const displayHeight = convertHeight(initialHeight, 'metric', measurementSystem);
      setHeight(formatHeight(displayHeight, measurementSystem));
    }
  }, [initialWeight, initialHeight, measurementSystem]);

  // Calculate BMI when weight or height changes
  useEffect(() => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (weightNum > 0 && heightNum > 0) {
      calculateBMI(weightNum, heightNum);
    } else {
      setBMI(null);
      setWeightDifference(null);
    }
  }, [weight, height, measurementSystem]);

  const calculateBMI = (displayWeight: number, displayHeight: number) => {
    if (displayWeight <= 0 || displayHeight <= 0) {
      setBMI(null);
      setWeightDifference(null);
      return;
    }

    // Convert display values to metric for BMI calculation
    const metricWeight = convertWeight(displayWeight, measurementSystem, 'metric');
    const metricHeight = convertHeight(displayHeight, measurementSystem, 'metric');

    // BMI formula: weight (kg) / (height (m))²
    const heightInMeters = metricHeight / 100;
    const bmiValue = metricWeight / (heightInMeters * heightInMeters);
    setBMI(parseFloat(bmiValue.toFixed(1)));

    // Calculate weight difference for healthy BMI range (18.5 - 24.9) in metric
    const idealWeightLowerMetric = 18.5 * (heightInMeters * heightInMeters);
    const idealWeightUpperMetric = 24.9 * (heightInMeters * heightInMeters);

    let weightDiffMetric = 0;
    if (bmiValue < 18.5) {
      // Underweight - how much to gain to reach BMI of 18.5
      weightDiffMetric = idealWeightLowerMetric - metricWeight;
    } else if (bmiValue > 24.9) {
      // Overweight - how much to lose to reach BMI of 24.9
      weightDiffMetric = metricWeight - idealWeightUpperMetric;
    }

    if (weightDiffMetric > 0) {
      // Convert weight difference to display units
      const displayWeightDiff = convertWeight(weightDiffMetric, 'metric', measurementSystem);
      setWeightDifference(parseFloat(formatWeight(displayWeightDiff, measurementSystem)));
    } else {
      setWeightDifference(null);
    }
  };

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return "underweight";
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return "healthyWeight";
    if (bmiValue > 24.9 && bmiValue <= 29.9) return "overweight";
    return "obesity";
  };

  const getStatusColor = (bmiValue: number) => {
    if (bmiValue < 18.5) return "text-blue-500";
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return "text-green-500";
    if (bmiValue > 24.9 && bmiValue <= 29.9) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t("bmiCalculator")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-1">
                {t("weight")} ({weightUnit})
              </label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={`Enter your weight in ${weightUnit}`}
                step={measurementSystem === 'imperial' ? '0.1' : '0.1'}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium mb-1">
                {t("height")} ({heightUnit})
              </label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={`Enter your height in ${heightUnit}`}
                step={measurementSystem === 'imperial' ? '0.1' : '1'}
                className="w-full"
              />
            </div>
          </div>
          
          {bmi !== null && (
            <div className="bg-card/50 p-6 rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">{t("bmiResult")}</h3>
              <p className="text-3xl font-bold mb-2">
                {t("bmiValue")} <span className={getStatusColor(bmi)}>{bmi}</span>
              </p>
              <p className="mb-4">{t(getBMICategory(bmi))}</p>
              
              {weightDifference !== null && (
                <div className="text-sm">
                  {bmi < 18.5 ? (
                    <p>{t("weightToGain")} <strong>{Math.abs(weightDifference)} {weightUnit}</strong></p>
                  ) : bmi > 24.9 ? (
                    <p>{t("weightToLose")} <strong>{Math.abs(weightDifference)} {weightUnit}</strong></p>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BMICalculator;

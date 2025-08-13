
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { convertWeight, convertHeight, getWeightUnit, getHeightUnit } from '@/utils/unitConversions';

interface BMICalculatorProps {
  initialWeight?: number;
  initialHeight?: number;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ initialWeight, initialHeight }) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmi, setBMI] = useState<number | null>(null);
  const [weightDifference, setWeightDifference] = useState<number | null>(null);

  // Update BMI calculator values when the props change (sync with form)
  useEffect(() => {
    if (initialWeight && initialWeight > 0) {
      const displayWeight = convertWeight(initialWeight, 'metric', measurementSystem);
      setWeight(displayWeight.toString());
    }
    if (initialHeight && initialHeight > 0) {
      const displayHeight = convertHeight(initialHeight, 'metric', measurementSystem);
      setHeight(displayHeight.toString());
    }
  }, [initialWeight, initialHeight, measurementSystem]);

  // Calculate BMI when weight or height changes
  useEffect(() => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (weightNum > 0 && heightNum > 0) {
      // Convert input values to metric for calculation
      const metricWeight = convertWeight(weightNum, measurementSystem, 'metric');
      const metricHeight = convertHeight(heightNum, measurementSystem, 'metric');
      calculateBMI(metricWeight, metricHeight);
    } else {
      setBMI(null);
      setWeightDifference(null);
    }
  }, [weight, height, measurementSystem]);

  const calculateBMI = (weightNum: number, heightNum: number) => {
    if (weightNum <= 0 || heightNum <= 0) {
      setBMI(null);
      setWeightDifference(null);
      return;
    }

    // BMI formula: weight (kg) / (height (m))²
    const heightInMeters = heightNum / 100;
    const bmiValue = weightNum / (heightInMeters * heightInMeters);
    setBMI(parseFloat(bmiValue.toFixed(1)));

    // Calculate weight difference for healthy BMI range (18.5 - 24.9)
    const idealWeightLower = 18.5 * (heightInMeters * heightInMeters);
    const idealWeightUpper = 24.9 * (heightInMeters * heightInMeters);

    if (bmiValue < 18.5) {
      // Underweight - how much to gain to reach BMI of 18.5
      const metricDifference = idealWeightLower - weightNum;
      const displayDifference = convertWeight(metricDifference, 'metric', measurementSystem);
      setWeightDifference(parseFloat(displayDifference.toFixed(1)));
    } else if (bmiValue > 24.9) {
      // Overweight - how much to lose to reach BMI of 24.9
      const metricDifference = weightNum - idealWeightUpper;
      const displayDifference = convertWeight(metricDifference, 'metric', measurementSystem);
      setWeightDifference(parseFloat(displayDifference.toFixed(1)));
    } else {
      // Healthy weight
      setWeightDifference(null);
    }
  };

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return "Healthy weight";
    if (bmiValue > 24.9 && bmiValue <= 29.9) return "Overweight";
    return "Obesity";
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
        <CardTitle>{t("BMI calculator")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-1">
                {t("weight")} ({getWeightUnit(measurementSystem)})
              </label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium mb-1">
                {t("Height")} ({getHeightUnit(measurementSystem)})
              </label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter your height"
                className="w-full"
              />
            </div>
          </div>
          
          {bmi !== null && (
            <div className="bg-card/50 p-6 rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">{t("BMI result")}</h3>
              <p className="text-3xl font-bold mb-2">
                {t("BMI value")} <span className={getStatusColor(bmi)}>{bmi}</span>
              </p>
              <p className="mb-4">{t(getBMICategory(bmi))}</p>
              
              {weightDifference !== null && (
                <div className="text-sm">
                  {bmi < 18.5 ? (
                    <p>{t("weightToGain")} <strong>{Math.abs(weightDifference)} {getWeightUnit(measurementSystem)}</strong></p>
                  ) : bmi > 24.9 ? (
                    <p>{t("weightToLose")} <strong>{Math.abs(weightDifference)} {getWeightUnit(measurementSystem)}</strong></p>
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

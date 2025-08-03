
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface BMICalculatorProps {
  initialWeight?: number;
  initialHeight?: number;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ initialWeight = 0, initialHeight = 0 }) => {
  const { t } = useLanguage();
  const [weight, setWeight] = useState<string>(initialWeight > 0 ? initialWeight.toString() : '');
  const [height, setHeight] = useState<string>(initialHeight > 0 ? initialHeight.toString() : '');
  const [bmi, setBMI] = useState<number | null>(null);
  const [weightDifference, setWeightDifference] = useState<number | null>(null);

  // Don't render if no valid initial values
  if (initialWeight <= 0 || initialHeight <= 0) {
    return null;
  }

  // Update BMI calculator values when the props change (sync with form)
  useEffect(() => {
    if (initialWeight && initialWeight > 0) {
      setWeight(initialWeight.toString());
    }
    if (initialHeight && initialHeight > 0) {
      setHeight(initialHeight.toString());
    }
  }, [initialWeight, initialHeight]);

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
  }, [weight, height]);

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
      setWeightDifference(parseFloat((idealWeightLower - weightNum).toFixed(1)));
    } else if (bmiValue > 24.9) {
      // Overweight - how much to lose to reach BMI of 24.9
      setWeightDifference(parseFloat((weightNum - idealWeightUpper).toFixed(1)));
    } else {
      // Healthy weight
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
                {t("weight")} ({t("kg")})
              </label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium mb-1">
                {t("height")} ({t("cm")})
              </label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
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
                    <p>{t("weightToGain")} <strong>{Math.abs(weightDifference)} {t("kg")}</strong></p>
                  ) : bmi > 24.9 ? (
                    <p>{t("weightToLose")} <strong>{Math.abs(weightDifference)} {t("kg")}</strong></p>
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

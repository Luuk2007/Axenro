
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Dumbbell } from 'lucide-react';

const OneRepMaxCalculator = () => {
  const { t } = useLanguage();
  const [weight, setWeight] = useState<number | ''>('');
  const [reps, setReps] = useState<number | ''>('');
  const [formula, setFormula] = useState('brzycki');
  const [result, setResult] = useState<number | null>(null);
  
  // Formulas for calculating 1RM
  const calculateOneRM = () => {
    if (weight === '' || reps === '' || reps < 1) return;
    
    let oneRM = 0;
    
    switch (formula) {
      case 'brzycki':
        // Brzycki: 1RM = weight × (36 / (37 - reps))
        oneRM = weight * (36 / (37 - Math.min(reps, 36)));
        break;
      case 'epley':
        // Epley: 1RM = weight × (1 + 0.0333 × reps)
        oneRM = weight * (1 + 0.0333 * reps);
        break;
      case 'lander':
        // Lander: 1RM = (100 × weight) / (101.3 - 2.67123 × reps)
        oneRM = (100 * weight) / (101.3 - 2.67123 * reps);
        break;
      default:
        oneRM = weight * (36 / (37 - Math.min(reps, 36)));
    }
    
    setResult(Math.round(oneRM * 10) / 10);
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
              <Label htmlFor="weight">{t("weight")} (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
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
                onChange={(e) => setReps(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g., 5"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="formula">{t("formula")}</Label>
            <Select
              value={formula}
              onValueChange={setFormula}
            >
              <SelectTrigger id="formula">
                <SelectValue placeholder="Select formula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brzycki">Brzycki</SelectItem>
                <SelectItem value="epley">Epley</SelectItem>
                <SelectItem value="lander">Lander</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={calculateOneRM} 
            className="w-full mt-4"
            disabled={weight === '' || reps === ''}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {t("calculate")}
          </Button>
          
          {result !== null && (
            <div className="mt-4 p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">{t("estimatedOneRepMax")}</p>
              <p className="text-2xl font-bold">{result} kg</p>
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

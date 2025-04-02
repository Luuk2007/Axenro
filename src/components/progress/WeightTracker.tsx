
import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowUp, ArrowDown, Plus, Weight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface WeightEntry {
  date: string;
  value: number;
}

export function WeightTracker() {
  const { t } = useLanguage();
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [startingWeight, setStartingWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [showAddWeightDialog, setShowAddWeightDialog] = useState(false);

  // On first load, check if we have weight data in localStorage
  useEffect(() => {
    const savedWeightHistory = localStorage.getItem('weightHistory');
    const savedStartingWeight = localStorage.getItem('startingWeight');
    const savedTargetWeight = localStorage.getItem('targetWeight');

    if (savedWeightHistory) {
      setWeightHistory(JSON.parse(savedWeightHistory));
    } else {
      // If no history exists, initialize with empty array
      setWeightHistory([]);
    }

    if (savedStartingWeight) {
      setStartingWeight(parseFloat(savedStartingWeight));
    }

    if (savedTargetWeight) {
      setTargetWeight(parseFloat(savedTargetWeight));
    }
  }, []);

  // Save to localStorage whenever our data changes
  useEffect(() => {
    if (weightHistory.length > 0) {
      localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
    }

    if (startingWeight !== null) {
      localStorage.setItem('startingWeight', startingWeight.toString());
    }

    if (targetWeight !== null) {
      localStorage.setItem('targetWeight', targetWeight.toString());
    }
  }, [weightHistory, startingWeight, targetWeight]);

  // Calculate progress
  const progressPercentage = React.useMemo(() => {
    if (!startingWeight || !targetWeight || startingWeight === targetWeight) {
      return 0;
    }

    const latestWeight = weightHistory.length > 0 
      ? weightHistory[weightHistory.length - 1].value 
      : startingWeight;
    
    const isGaining = targetWeight > startingWeight;
    
    if (isGaining) {
      // Weight gain progress
      const totalToGain = targetWeight - startingWeight;
      const gained = latestWeight - startingWeight;
      return Math.min(Math.max(0, (gained / totalToGain) * 100), 100);
    } else {
      // Weight loss progress  
      const totalToLose = startingWeight - targetWeight;
      const lost = startingWeight - latestWeight;
      return Math.min(Math.max(0, (lost / totalToLose) * 100), 100);
    }
  }, [weightHistory, startingWeight, targetWeight]);

  // Add new weight entry
  const handleAddWeight = () => {
    if (!newWeight) {
      toast.error(t("pleaseEnterValue"));
      return;
    }

    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue)) {
      toast.error(t("pleaseEnterValidNumber"));
      return;
    }

    const today = format(new Date(), 'MMM d');
    
    // Check if this is the first weight entry
    if (weightHistory.length === 0 && startingWeight === null) {
      setStartingWeight(weightValue);
    }
    
    // Add the new weight entry
    const newEntry = { date: today, value: weightValue };
    const updatedHistory = [...weightHistory, newEntry];
    
    // Sort by date (assuming the date format allows for string comparison)
    updatedHistory.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    setWeightHistory(updatedHistory);
    setNewWeight('');
    setShowAddWeightDialog(false);
    toast.success(t("weightUpdated"));
  };

  // Update target weight
  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWeight) {
      toast.error(t("pleaseEnterTargetWeight"));
      return;
    }
    toast.success(t("targetWeightUpdated"));
  };

  // Calculate weight change indicators
  const getWeightChange = () => {
    if (weightHistory.length < 2) return null;
    
    const latest = weightHistory[weightHistory.length - 1].value;
    const previous = weightHistory[weightHistory.length - 2].value;
    const change = latest - previous;
    
    return {
      value: Math.abs(change).toFixed(1),
      isGain: change > 0,
    };
  };

  const weightChange = getWeightChange();

  return (
    <>
      <div className="glassy-card rounded-xl overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-medium tracking-tight">{t("weightProgress")}</h3>
          <Dialog open={showAddWeightDialog} onOpenChange={setShowAddWeightDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                {t("logWeight")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("logWeight")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("weight")} (kg)</label>
                  <Input 
                    type="number" 
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    step="0.1"
                    placeholder="70.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("date")}</label>
                  <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <Button onClick={handleAddWeight} className="w-full">
                  {t("add")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="p-4">
          {weightHistory.length > 0 ? (
            <>
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold tracking-tight mr-2">
                  {weightHistory[weightHistory.length - 1].value} kg
                </span>
                {weightChange && (
                  <span className={`text-xs font-medium ${weightChange.isGain ? 'text-red-500' : 'text-green-500'}`}>
                    {weightChange.isGain ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                    {weightChange.value} kg
                  </span>
                )}
              </div>
              <div className="h-[180px] mt-4">
                <ProgressChart
                  data={weightHistory}
                  title=""
                  label="kg"
                  color="#4F46E5"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Weight className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg mb-2">{t("noWeightData")}</h3>
              <p className="text-muted-foreground mb-4 max-w-xs">
                {t("startTrackingWeightDesc")}
              </p>
              <Button onClick={() => setShowAddWeightDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {t("logFirstWeight")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {weightHistory.length > 0 && (
        <div className="glassy-card rounded-xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-medium tracking-tight">{t("weightGoal")}</h3>
          </div>
          <div className="p-5">
            {targetWeight && startingWeight ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {startingWeight < targetWeight ? t("weightGainGoal") : t("weightLossGoal")}
                  </span>
                  <span className="text-sm font-medium">{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 mb-4" />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>{t("startingWeight")}: <span className="font-medium">{startingWeight} kg</span></div>
                  <div>{t("targetWeight")}: <span className="font-medium">{targetWeight} kg</span></div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Show dialog to update target weight
                      const newTarget = prompt(t("enterNewTargetWeight"), targetWeight.toString());
                      if (newTarget) {
                        const parsed = parseFloat(newTarget);
                        if (!isNaN(parsed)) {
                          setTargetWeight(parsed);
                          toast.success(t("targetUpdated"));
                        }
                      }
                    }}
                  >
                    {t("updateTarget")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">{t("setWeightGoal")}</p>
                <form onSubmit={handleUpdateTarget} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t("targetWeight")} (kg)</label>
                    <Input 
                      type="number"
                      value={targetWeight || ''}
                      onChange={(e) => setTargetWeight(parseFloat(e.target.value) || null)}
                      step="0.1"
                      placeholder="65.0"
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit">{t("saveTarget")}</Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

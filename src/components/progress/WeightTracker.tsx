
import React, { useState, useEffect } from 'react';
import { format, parse, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ArrowUp, ArrowDown, Plus, Weight, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface WeightEntry {
  date: string;
  value: number;
  originalDate?: string;
  id: string; // Add unique ID for deletion
}

export function WeightTracker() {
  const { t } = useLanguage();
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [startingWeight, setStartingWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [showAddWeightDialog, setShowAddWeightDialog] = useState(false);
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [newTargetWeight, setNewTargetWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Load data from localStorage on mount
  useEffect(() => {
    const savedWeightHistory = localStorage.getItem('weightHistory');
    const savedStartingWeight = localStorage.getItem('startingWeight');
    const savedTargetWeight = localStorage.getItem('targetWeight');

    if (savedWeightHistory) {
      try {
        const parsedHistory = JSON.parse(savedWeightHistory);
        // Ensure all entries have IDs for delete functionality
        const historyWithIds = parsedHistory.map((entry: WeightEntry, index: number) => ({
          ...entry,
          id: entry.id || `weight-${Date.now()}-${index}`
        }));
        setWeightHistory(historyWithIds);
      } catch (error) {
        console.error('Error loading weight history:', error);
        setWeightHistory([]);
      }
    }

    if (savedStartingWeight) {
      setStartingWeight(parseFloat(savedStartingWeight));
    }

    if (savedTargetWeight) {
      setTargetWeight(parseFloat(savedTargetWeight));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (weightHistory.length > 0) {
      localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
    }
  }, [weightHistory]);

  useEffect(() => {
    if (startingWeight !== null) {
      localStorage.setItem('startingWeight', startingWeight.toString());
    }
  }, [startingWeight]);

  useEffect(() => {
    if (targetWeight !== null) {
      localStorage.setItem('targetWeight', targetWeight.toString());
    }
  }, [targetWeight]);

  // Calculate progress percentage
  const progressPercentage = React.useMemo(() => {
    if (!startingWeight || !targetWeight || startingWeight === targetWeight) {
      return 0;
    }

    const latestWeight = weightHistory.length > 0 
      ? weightHistory[weightHistory.length - 1].value 
      : startingWeight;
    
    const isGaining = targetWeight > startingWeight;
    
    if (isGaining) {
      const totalToGain = targetWeight - startingWeight;
      const gained = latestWeight - startingWeight;
      return Math.min(Math.max(0, (gained / totalToGain) * 100), 100);
    } else {
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

    // Check if this is the first weight entry
    if (weightHistory.length === 0 && startingWeight === null) {
      setStartingWeight(weightValue);
    }
    
    // Create new entry with unique ID
    const dateObj = parseISO(selectedDate);
    const originalDate = selectedDate;
    const formattedDate = format(dateObj, 'MMM d');
    const newEntry: WeightEntry = { 
      date: formattedDate, 
      value: weightValue,
      originalDate,
      id: `weight-${Date.now()}-${Math.random()}`
    };
    
    // Add and sort by date
    const updatedHistory = [...weightHistory, newEntry].sort((a, b) => {
      const dateA = new Date(a.originalDate || a.date);
      const dateB = new Date(b.originalDate || b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    setWeightHistory(updatedHistory);
    setNewWeight('');
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setShowAddWeightDialog(false);
    toast.success(t("weightUpdated"));
  };

  // Delete weight entry
  const handleDeleteWeight = (id: string) => {
    const updatedHistory = weightHistory.filter(entry => entry.id !== id);
    setWeightHistory(updatedHistory);
    
    // Update localStorage immediately
    if (updatedHistory.length > 0) {
      localStorage.setItem('weightHistory', JSON.stringify(updatedHistory));
    } else {
      localStorage.removeItem('weightHistory');
    }
    
    toast.success(t("weightDeleted"));
  };

  // Update target weight
  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTargetWeight) {
      toast.error(t("pleaseEnterTargetWeight"));
      return;
    }
    
    const parsedTarget = parseFloat(newTargetWeight);
    if (isNaN(parsedTarget)) {
      toast.error(t("pleaseEnterValidNumber"));
      return;
    }
    
    setTargetWeight(parsedTarget);
    setNewTargetWeight('');
    setShowTargetDialog(false);
    toast.success(t("targetUpdated"));
  };

  // Get weight change indicators
  const getWeightChange = () => {
    if (weightHistory.length < 2) return null;
    
    const sortedHistory = [...weightHistory].sort((a, b) => {
      const dateA = new Date(a.originalDate || a.date);
      const dateB = new Date(b.originalDate || b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    const latest = sortedHistory[sortedHistory.length - 1].value;
    const previous = sortedHistory[sortedHistory.length - 2].value;
    const change = latest - previous;
    
    return {
      value: Math.abs(change).toFixed(1),
      isGain: change > 0,
    };
  };

  // Prepare chart data - ensure proper formatting
  const chartData = React.useMemo(() => {
    console.log('WeightTracker chartData - raw weightHistory:', weightHistory);
    
    if (weightHistory.length === 0) {
      console.log('WeightTracker chartData - no weight history, returning empty array');
      return [];
    }
    
    const sortedData = [...weightHistory]
      .sort((a, b) => {
        const dateA = new Date(a.originalDate || a.date);
        const dateB = new Date(b.originalDate || b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .map(entry => ({
        date: entry.date,
        value: entry.value,
        originalDate: entry.originalDate
      }));
    
    console.log('WeightTracker chartData - sorted and formatted:', sortedData);
    return sortedData;
  }, [weightHistory]);

  const weightChange = getWeightChange();
  const currentWeight = weightHistory.length > 0 
    ? [...weightHistory].sort((a, b) => {
        const dateA = new Date(a.originalDate || a.date);
        const dateB = new Date(b.originalDate || b.date);
        return dateB.getTime() - dateA.getTime();
      })[0].value
    : null;

  console.log('WeightTracker render - weightHistory length:', weightHistory.length);
  console.log('WeightTracker render - chartData length:', chartData.length);
  console.log('WeightTracker render - targetWeight:', targetWeight);

  return (
    <>
      {/* Main Weight Chart Card */}
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
                <DialogDescription>{t("trackYourWeightProgress")}</DialogDescription>
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
                  <Input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)} 
                  />
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
              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-semibold tracking-tight mr-2">
                  {currentWeight} kg
                </span>
                {weightChange && (
                  <span className={`text-xs font-medium ${weightChange.isGain ? 'text-red-500' : 'text-green-500'}`}>
                    {weightChange.isGain ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                    {weightChange.value} kg
                  </span>
                )}
              </div>
              
              {/* Weight Progress Chart - Always show when data exists */}
              <div className="h-[200px] mb-6">
                <ProgressChart
                  data={chartData}
                  title=""
                  label="kg"
                  color="#4F46E5"
                  targetValue={targetWeight || undefined}
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

      {/* Weight History Table */}
      {weightHistory.length > 0 && (
        <div className="glassy-card rounded-xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-medium tracking-tight">{t("Weight History")}</h3>
          </div>
          <div className="p-5">
            <div className="max-h-72 overflow-y-auto">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="pb-2 font-medium">{t("date")}</TableHead>
                    <TableHead className="pb-2 font-medium text-right">{t("weight")}</TableHead>
                    <TableHead className="pb-2 font-medium w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...weightHistory]
                    .sort((a, b) => {
                      const dateA = new Date(a.originalDate || a.date);
                      const dateB = new Date(b.originalDate || b.date);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map(entry => (
                      <TableRow key={entry.id} className="border-b border-border">
                        <TableCell className="py-3">
                          {entry.originalDate ? format(parseISO(entry.originalDate), 'MMM d, yyyy') : entry.date}
                        </TableCell>
                        <TableCell className="py-3 text-right">{entry.value} kg</TableCell>
                        <TableCell className="py-3">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteWeight(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Weight Goal Card */}
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
                <ProgressBar value={progressPercentage} className="h-2 mb-4" />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>{t("startingWeight")}: <span className="font-medium">{startingWeight} kg</span></div>
                  <div>{t("targetWeight")}: <span className="font-medium">{targetWeight} kg</span></div>
                </div>
                
                <div className="mt-4">
                  <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        {t("updateTarget")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("updateTarget")}</DialogTitle>
                        <DialogDescription>
                          {t("enterNewTargetWeight")}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateTarget} className="space-y-4 py-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t("targetWeight")} (kg)</label>
                          <Input 
                            type="number"
                            value={newTargetWeight}
                            onChange={(e) => setNewTargetWeight(e.target.value)}
                            step="0.1"
                            placeholder={targetWeight?.toString() || ''}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">{t("saveTarget")}</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                      value={newTargetWeight}
                      onChange={(e) => setNewTargetWeight(e.target.value)}
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

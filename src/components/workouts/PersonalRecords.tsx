
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import OneRepMaxCalculator from './OneRepMaxCalculator';
import { Trash2, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { convertWeight, getWeightUnit, formatWeight } from '@/utils/unitConversions';

type PersonalRecord = {
  id: string;
  exerciseName: string;
  weight: number; // Always stored in kg (metric)
  date: string;
};

const PersonalRecords = () => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [calculatedWeight, setCalculatedWeight] = useState<number | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');

  // Load personal records from localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('personalRecords');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (error) {
        console.error('Error loading personal records:', error);
      }
    }
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('personalRecords', JSON.stringify(records));
  }, [records]);

  // Handler for weight calculation from OneRepMaxCalculator (receives metric weight)
  const handleWeightCalculated = (metricWeight: number) => {
    setCalculatedWeight(metricWeight);
  };

  // Save record handler
  const saveRecord = () => {
    if (!calculatedWeight || !exerciseName.trim()) {
      return;
    }
    
    const newRecord: PersonalRecord = {
      id: Date.now().toString(),
      exerciseName: exerciseName.trim(),
      weight: calculatedWeight, // Store in metric
      date: new Date().toISOString().split('T')[0]
    };
    
    setRecords(prev => [...prev, newRecord]);
    setExerciseName('');
    setDialogOpen(false);
    toast.success(t('Record saved'));
    
    // Switch to the records tab after saving
    setActiveTab('records');
  };

  // Delete record handler
  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
    toast.success(t('Record deleted'));
  };

  const getDisplayWeight = (metricWeight: number) => {
    return convertWeight(metricWeight, 'metric', measurementSystem);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calculator">{t('One rep max calculator')}</TabsTrigger>
          <TabsTrigger value="records">{t('Personal records')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <OneRepMaxCalculator onCalculate={handleWeightCalculated} />
          
          {calculatedWeight && (
            <div className="mt-4 flex justify-center">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Trophy className="mr-2 h-4 w-4" />
                    {t('Save Record')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('Save Record')}</DialogTitle>
                    <DialogDescription>
                      {t('Estimated One Rep Max')}: {formatWeight(getDisplayWeight(calculatedWeight), measurementSystem)} {getWeightUnit(measurementSystem)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="exerciseName" className="text-right">
                        {t('exerciseName')}
                      </Label>
                      <Input
                        id="exerciseName"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., Bench Press"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={saveRecord} disabled={!exerciseName.trim()}>
                      {t('Save Record')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {t('Personal records')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('No personal records')}</p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('calculator')}
                    className="mt-2"
                  >
                    {t('Add personal record')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => {
                    const displayWeight = getDisplayWeight(record.weight);
                    return (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium">{record.exerciseName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatWeight(displayWeight, measurementSystem)} {getWeightUnit(measurementSystem)} • {record.date}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteRecord(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalRecords;

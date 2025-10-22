
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const { user } = useAuth();
  const { measurementSystem } = useMeasurementSystem();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [calculatedWeight, setCalculatedWeight] = useState<number | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [loading, setLoading] = useState(true);

  // Load personal records from Supabase
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('personal_records')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedRecords: PersonalRecord[] = data.map(record => ({
            id: record.id,
            exerciseName: record.exercise_name,
            weight: Number(record.weight),
            date: record.date
          }));
          setRecords(formattedRecords);
        }
      } catch (error) {
        console.error('Error loading personal records:', error);
        toast.error(t('Failed to load personal records'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user, t]);

  // Handler for weight calculation from OneRepMaxCalculator (receives metric weight)
  const handleWeightCalculated = (metricWeight: number) => {
    setCalculatedWeight(metricWeight);
  };

  // Save record handler
  const saveRecord = async () => {
    if (!calculatedWeight || !exerciseName.trim() || !user) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .insert({
          user_id: user.id,
          exercise_name: exerciseName.trim(),
          weight: calculatedWeight,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newRecord: PersonalRecord = {
          id: data.id,
          exerciseName: data.exercise_name,
          weight: Number(data.weight),
          date: data.date
        };
        
        setRecords(prev => [newRecord, ...prev]);
        setExerciseName('');
        setDialogOpen(false);
        toast.success(t('Record saved'));
        
        // Switch to the records tab after saving
        setActiveTab('records');
      }
    } catch (error) {
      console.error('Error saving personal record:', error);
      toast.error(t('Failed to save record'));
    }
  };

  // Delete record handler
  const deleteRecord = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('personal_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setRecords(prev => prev.filter(record => record.id !== id));
      toast.success(t('Record deleted'));
    } catch (error) {
      console.error('Error deleting personal record:', error);
      toast.error(t('Failed to delete record'));
    }
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
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('Loading')}...</p>
                </div>
              ) : records.length === 0 ? (
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

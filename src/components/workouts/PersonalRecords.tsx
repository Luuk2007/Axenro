import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import OneRepMaxCalculator from './OneRepMaxCalculator';
import { Trash2, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type PersonalRecord = {
  id: string;
  exerciseName: string;
  weight: number; // Always stored in kg (metric)
  date: string;
};

const PersonalRecords = () => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const { user } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [calculatedWeight, setCalculatedWeight] = useState<number | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [loading, setLoading] = useState(true);
  
  // State for update PR modal
  const [selectedRecord, setSelectedRecord] = useState<PersonalRecord | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateWeight, setUpdateWeight] = useState('');
  const [updateReps, setUpdateReps] = useState('');
  const [newCalculatedWeight, setNewCalculatedWeight] = useState<number | null>(null);

  // Load personal records from Supabase
  useEffect(() => {
    const loadRecords = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('personal_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

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
        toast.error(t('Failed to load records'));
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [user, t]);

  const handleWeightCalculated = (metricWeight: number) => {
    setCalculatedWeight(metricWeight);
  };

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
      }

      setExerciseName('');
      setDialogOpen(false);
      toast.success(t('Record saved'));
      setActiveTab('records');
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error(t('Failed to save record'));
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('personal_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecords(prev => prev.filter(record => record.id !== id));
      toast.success(t('Record deleted'));
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(t('Failed to delete record'));
    }
  };

  // Handle clicking on a record to update it
  const handleRecordClick = (record: PersonalRecord) => {
    setSelectedRecord(record);
    setUpdateWeight('');
    setUpdateReps('');
    setNewCalculatedWeight(null);
    setUpdateDialogOpen(true);
  };

  // Calculate new 1RM when updating
  const calculateNew1RM = () => {
    const weightNum = parseFloat(updateWeight);
    const repsNum = parseFloat(updateReps);
    
    if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum < 1) return;
    
    const metricWeight = convertWeight(weightNum, measurementSystem, 'metric');
    const oneRMMetric = metricWeight * (1 + 0.0333 * repsNum);
    setNewCalculatedWeight(oneRMMetric);
  };

  // Update the PR with new calculated weight
  const updateRecord = async () => {
    if (!newCalculatedWeight || !selectedRecord || !user) return;

    try {
      const { error } = await supabase
        .from('personal_records')
        .update({
          weight: newCalculatedWeight,
          date: new Date().toISOString().split('T')[0]
        })
        .eq('id', selectedRecord.id);

      if (error) throw error;

      setRecords(prev => prev.map(record => 
        record.id === selectedRecord.id 
          ? { ...record, weight: newCalculatedWeight, date: new Date().toISOString().split('T')[0] }
          : record
      ));

      setUpdateDialogOpen(false);
      setSelectedRecord(null);
      toast.success(t('Record updated'));
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error(t('Failed to update record'));
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
                      <div 
                        key={record.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleRecordClick(record)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-1">
                            <div className="font-medium">{record.exerciseName}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatWeight(displayWeight, measurementSystem)} {getWeightUnit(measurementSystem)} • {record.date}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecord(record.id);
                          }}
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

      {/* Update PR Modal */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('Update Record')}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord && (
                <>
                  {selectedRecord.exerciseName} - {t('Current')}: {formatWeight(getDisplayWeight(selectedRecord.weight), measurementSystem)} {getWeightUnit(measurementSystem)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="updateWeight">{t("weight")} ({getWeightUnit(measurementSystem)})</Label>
                <Input
                  id="updateWeight"
                  type="number"
                  min="0"
                  value={updateWeight}
                  onChange={(e) => {
                    setUpdateWeight(e.target.value);
                    setNewCalculatedWeight(null);
                  }}
                  placeholder="e.g., 65"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="updateReps">{t("reps")}</Label>
                <Input
                  id="updateReps"
                  type="number"
                  min="1"
                  max="36"
                  value={updateReps}
                  onChange={(e) => {
                    setUpdateReps(e.target.value);
                    setNewCalculatedWeight(null);
                  }}
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <Button 
              onClick={calculateNew1RM}
              className="w-full"
              disabled={!updateWeight || !updateReps}
              variant="secondary"
            >
              {t("Calculate")}
            </Button>

            {newCalculatedWeight && selectedRecord && (
              <div className="p-4 bg-muted rounded-md text-center space-y-2">
                <p className="text-sm text-muted-foreground">{t("New Estimated One Rep Max")}</p>
                <p className="text-2xl font-bold">
                  {formatWeight(getDisplayWeight(newCalculatedWeight), measurementSystem)} {getWeightUnit(measurementSystem)}
                </p>
                {newCalculatedWeight > selectedRecord.weight && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +{formatWeight(getDisplayWeight(newCalculatedWeight - selectedRecord.weight), measurementSystem)} {getWeightUnit(measurementSystem)} {t('improvement')}!
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={updateRecord} 
              disabled={!newCalculatedWeight || (selectedRecord && newCalculatedWeight <= selectedRecord.weight)}
            >
              {t('Update Record')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalRecords;

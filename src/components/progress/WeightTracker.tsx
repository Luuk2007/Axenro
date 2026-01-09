import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2, Scale, TrendingDown, TrendingUp, Target, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, getWeightUnit } from "@/utils/unitConversions";
import { useWeightData } from "@/hooks/useWeightData";
import { useIsMobile } from "@/hooks/use-mobile";

const WeightTracker = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { measurementSystem } = useMeasurementSystem();
  const [newWeight, setNewWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingEntry, setEditingEntry] = useState<{date: string, weight: number} | null>(null);
  const [editWeight, setEditWeight] = useState("");
  
  const {
    weightData,
    loading,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry
  } = useWeightData();

  const handleAddWeight = async () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error(t("Please enter a valid weight"));
      return;
    }

    // Convert to metric for storage
    const metricWeight = convertWeight(weight, measurementSystem, 'metric');
    
    await addWeightEntry({
      date: selectedDate,
      value: metricWeight
    });
    
    setNewWeight("");
  };

  const handleEditWeight = async () => {
    if (!editingEntry) return;
    
    const weight = parseFloat(editWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error(t("Please enter a valid weight"));
      return;
    }

    // Convert to metric for storage
    const metricWeight = convertWeight(weight, measurementSystem, 'metric');
    
    await updateWeightEntry(editingEntry.date, metricWeight);
    setEditingEntry(null);
    setEditWeight("");
  };

  const handleDeleteWeight = async (date: string) => {
    await deleteWeightEntry(date);
  };

  const startEdit = (date: string, weight: number) => {
    // Convert from metric for display
    const displayWeight = convertWeight(weight, 'metric', measurementSystem);
    setEditingEntry({ date, weight });
    setEditWeight(displayWeight.toString());
  };

  // Convert weight data for display
  const displayWeightData = weightData.map(entry => ({
    ...entry,
    value: convertWeight(entry.value, 'metric', measurementSystem)
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const currentWeight = displayWeightData.length > 0 
    ? displayWeightData[displayWeightData.length - 1].value 
    : null;
  const startWeight = displayWeightData.length > 0 
    ? displayWeightData[0].value 
    : null;
  const weightChange = currentWeight && startWeight 
    ? currentWeight - startWeight 
    : null;

  const weightUnit = getWeightUnit(measurementSystem);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton with modern style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-muted animate-pulse" />
              <CardContent className="p-4 text-center">
                <div className="h-4 bg-muted rounded w-20 mx-auto mb-3 animate-pulse" />
                <div className="h-8 bg-muted rounded w-24 mx-auto animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Stats Cards - Modern Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Current Weight */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Scale className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Current Weight")}
              </p>
            </div>
            <p className="text-3xl font-bold">
              {currentWeight ? currentWeight.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{weightUnit}</p>
          </CardContent>
        </Card>

        {/* Starting Weight */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Target className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Starting Weight")}
              </p>
            </div>
            <p className="text-3xl font-bold">
              {startWeight ? startWeight.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{weightUnit}</p>
          </CardContent>
        </Card>

        {/* Total Change */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${weightChange !== null && weightChange < 0 ? 'from-green-500 to-green-600' : 'from-amber-500 to-amber-600'}`} />
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {weightChange !== null && weightChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-amber-500" />
              )}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Total Change")}
              </p>
            </div>
            <p className={`text-3xl font-bold ${weightChange !== null && weightChange < 0 ? 'text-green-600' : weightChange !== null && weightChange > 0 ? 'text-amber-600' : ''}`}>
              {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{weightUnit}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Card */}
      {displayWeightData.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              {t("Weight Progress")}
            </h3>
            <div className={`w-full ${isMobile ? 'h-[200px]' : 'h-64'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayWeightData} margin={{ left: isMobile ? 10 : 20, right: isMobile ? 10 : 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    fontSize={isMobile ? 10 : 12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    fontSize={isMobile ? 10 : 12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number) => [`${value.toFixed(1)} ${weightUnit}`, t("Weight")]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Weight Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {t("Add Entry")}
          </h3>
          <div className={`w-full ${isMobile ? 'space-y-4' : 'flex gap-4 items-end'}`}>
            <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
              <Label htmlFor="date" className="text-sm font-medium mb-2 block">
                <Calendar className="h-3 w-3 inline mr-1" />
                {t("Date")}
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
              <Label htmlFor="weight" className="text-sm font-medium mb-2 block">
                <Scale className="h-3 w-3 inline mr-1" />
                {t("Weight")} ({weightUnit})
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder={`Enter weight in ${weightUnit}`}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleAddWeight} className={`${isMobile ? 'w-full' : ''}`}>
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Entry")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight History Card */}
      {displayWeightData.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("Weight History")}</h3>
            <div className={`space-y-2 overflow-y-auto w-full ${isMobile ? 'max-h-48' : 'max-h-64'}`}>
              {displayWeightData.slice().reverse().map((entry) => (
                <div 
                  key={entry.date} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{entry.value.toFixed(1)} {weightUnit}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => startEdit(entry.date, weightData.find(w => w.date === entry.date)?.value || 0)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:text-destructive"
                      onClick={() => handleDeleteWeight(entry.date)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {displayWeightData.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t("Start Tracking Your Weight")}</h3>
            <p className="text-muted-foreground mb-6">{t("Add your first weight entry to begin tracking your progress.")}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingEntry && (
        <Dialog open={true} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Edit Weight Entry")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("Date")}: {formatDate(editingEntry.date)}</Label>
              </div>
              <div>
                <Label htmlFor="editWeight">{t("Weight")} ({weightUnit})</Label>
                <Input
                  id="editWeight"
                  type="number"
                  step="0.1"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingEntry(null)}>
                  {t("Cancel")}
                </Button>
                <Button onClick={handleEditWeight}>
                  {t("Save")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WeightTracker;

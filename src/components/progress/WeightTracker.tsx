
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit2 } from "lucide-react";
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
        <Card>
          <CardHeader>
            <CardTitle>{t("Weight Progress")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              <div className="text-center p-4 bg-primary/5 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mx-auto"></div>
              </div>
              <div className="text-center p-4 bg-secondary/5 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mx-auto"></div>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mx-auto"></div>
              </div>
            </div>
            <div className={`mb-6 ${isMobile ? 'h-[200px]' : 'h-64'} bg-muted rounded animate-pulse`}></div>
            <div className="space-y-4">
              <div className={`gap-4 items-end ${isMobile ? 'flex flex-col space-y-4' : 'flex'}`}>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-12 mb-2"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="h-10 bg-muted rounded w-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Weight Progress")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {currentWeight && (
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("Current Weight")}</p>
                <p className="text-2xl font-bold">{currentWeight.toFixed(1)} {weightUnit}</p>
              </div>
            )}
            {startWeight && (
              <div className="text-center p-4 bg-secondary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("Starting Weight")}</p>
                <p className="text-2xl font-bold">{startWeight.toFixed(1)} {weightUnit}</p>
              </div>
            )}
            {weightChange !== null && (
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("Total Change")}</p>
                <p className={`text-2xl font-bold ${weightChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {weightUnit}
                </p>
              </div>
            )}
          </div>

          {displayWeightData.length > 0 && (
            <div className={`mb-6 ${isMobile ? 'h-[200px]' : 'h-64'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayWeightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    fontSize={isMobile ? 10 : 12}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    fontSize={isMobile ? 10 : 12}
                  />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number) => [`${value.toFixed(1)} ${weightUnit}`, t("Weight")]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-4">
            <div className={`gap-4 items-end ${isMobile ? 'flex flex-col space-y-4' : 'flex'}`}>
              <div className={`flex-1 ${isMobile ? 'text-center' : ''}`}>
                <Label htmlFor="date" className={isMobile ? 'block text-center mb-2' : ''}>{t("Date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={isMobile ? 'text-center' : ''}
                />
              </div>
              <div className={`flex-1 ${isMobile ? 'text-center' : ''}`}>
                <Label htmlFor="weight" className={isMobile ? 'block text-center mb-2' : ''}>{t("Weight")} ({weightUnit})</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder={`Enter weight in ${weightUnit}`}
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className={isMobile ? 'text-center' : ''}
                />
              </div>
              <Button onClick={handleAddWeight} className={isMobile ? 'w-full' : ''}>
                {t("Add Entry")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {displayWeightData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("Weight History")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`space-y-2 overflow-y-auto ${isMobile ? 'max-h-48' : 'max-h-64'}`}>
              {displayWeightData.slice().reverse().map((entry) => (
                <div key={entry.date} className={`flex items-center justify-between p-2 border rounded ${isMobile ? 'flex-col space-y-2' : ''}`}>
                  <div className={isMobile ? 'text-center' : ''}>
                    <p className="font-medium">{formatDate(entry.date)}</p>
                    <p className="text-sm text-muted-foreground">{entry.value.toFixed(1)} {weightUnit}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(entry.date, weightData.find(w => w.date === entry.date)?.value || 0)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
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


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface MeasurementType {
  id: string;
  name: string;
  unit: string;
  enabled: boolean;
  isCustom?: boolean;
}

const defaultMeasurements: MeasurementType[] = [
  { id: 'chest', name: 'Chest', unit: 'cm', enabled: true },
  { id: 'waist', name: 'Waist', unit: 'cm', enabled: true },
  { id: 'hips', name: 'Hips', unit: 'cm', enabled: true },
  { id: 'biceps', name: 'Biceps', unit: 'cm', enabled: true },
  { id: 'thighs', name: 'Thighs', unit: 'cm', enabled: true },
  { id: 'calves', name: 'Calves', unit: 'cm', enabled: false },
  { id: 'bodyfat', name: 'Body Fat', unit: '%', enabled: false },
];

const BodyMeasurementsSettings = () => {
  const { t } = useLanguage();
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>(defaultMeasurements);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMeasurementName, setNewMeasurementName] = useState('');
  const [newMeasurementUnit, setNewMeasurementUnit] = useState('cm');

  useEffect(() => {
    const savedMeasurementTypes = localStorage.getItem('measurementTypes');
    if (savedMeasurementTypes) {
      try {
        setMeasurementTypes(JSON.parse(savedMeasurementTypes));
      } catch (error) {
        console.error('Error loading measurement types:', error);
      }
    }
  }, []);

  const saveMeasurementTypes = (types: MeasurementType[]) => {
    localStorage.setItem('measurementTypes', JSON.stringify(types));
    setMeasurementTypes(types);
    
    // Dispatch event to notify Progress page about changes
    window.dispatchEvent(new CustomEvent('measurementTypesChanged'));
  };

  const handleToggleMeasurement = (id: string, enabled: boolean) => {
    const updatedTypes = measurementTypes.map(type =>
      type.id === id ? { ...type, enabled } : type
    );
    saveMeasurementTypes(updatedTypes);
    toast.success(t('Settings saved'));
  };

  const handleAddCustomMeasurement = () => {
    if (!newMeasurementName.trim()) {
      toast.error(t('pleaseEnterValue'));
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newMeasurement: MeasurementType = {
      id: customId,
      name: newMeasurementName.trim(),
      unit: newMeasurementUnit,
      enabled: true,
      isCustom: true
    };

    const updatedTypes = [...measurementTypes, newMeasurement];
    saveMeasurementTypes(updatedTypes);
    
    setNewMeasurementName('');
    setNewMeasurementUnit('cm');
    setShowAddDialog(false);
    toast.success(t('measurementAdded'));
  };

  const handleDeleteCustomMeasurement = (id: string) => {
    const updatedTypes = measurementTypes.filter(type => type.id !== id);
    saveMeasurementTypes(updatedTypes);
    toast.success(t('measurementDeleted'));
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("Body Measurements")}</CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              {t("Choose which body measurements to track in your progress")}
            </p>
            
            <div className="space-y-3">
              {measurementTypes.map((measurement) => (
                <div key={measurement.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label htmlFor={measurement.id} className="font-medium">
                      {t(measurement.id) || measurement.name}
                    </Label>
                    <span className="text-sm text-muted-foreground">({measurement.unit})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={measurement.id}
                      checked={measurement.enabled}
                      onCheckedChange={(enabled) => handleToggleMeasurement(measurement.id, enabled)}
                    />
                    {measurement.isCustom && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCustomMeasurement(measurement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("Add Custom Measurement")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("Add Custom Measurement")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="measurement-name">{t("Measurement Name")}</Label>
                      <Input
                        id="measurement-name"
                        value={newMeasurementName}
                        onChange={(e) => setNewMeasurementName(e.target.value)}
                        placeholder={t("Enter measurement name")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="measurement-unit">{t("Unit")}</Label>
                      <select
                        id="measurement-unit"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={newMeasurementUnit}
                        onChange={(e) => setNewMeasurementUnit(e.target.value)}
                      >
                        <option value="cm">cm</option>
                        <option value="%">%</option>
                        <option value="mm">mm</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                    <Button onClick={handleAddCustomMeasurement} className="w-full">
                      {t("add")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default BodyMeasurementsSettings;

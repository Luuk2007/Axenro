
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Measurement {
  id: string;
  date: string;
  type: string;
  value: number;
  unit: string;
}

const measurementTypes = [
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'chest', label: 'Chest', unit: 'cm' },
  { value: 'waist', label: 'Waist', unit: 'cm' },
  { value: 'hips', label: 'Hips', unit: 'cm' },
  { value: 'thighs', label: 'Thighs', unit: 'cm' },
  { value: 'arms', label: 'Arms', unit: 'cm' },
  { value: 'bodyFat', label: 'Body Fat', unit: '%' },
];

export function MeasurementsTracker() {
  const { t } = useLanguage();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    type: 'weight',
    value: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load measurements from localStorage on component mount
  useEffect(() => {
    const savedMeasurements = localStorage.getItem('measurements');
    if (savedMeasurements) {
      setMeasurements(JSON.parse(savedMeasurements));
    }
  }, []);

  // Save measurements to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('measurements', JSON.stringify(measurements));
  }, [measurements]);

  const handleAddMeasurement = () => {
    if (!newMeasurement.value) {
      toast.error(t('pleaseEnterValue'));
      return;
    }

    const value = parseFloat(newMeasurement.value);
    if (isNaN(value)) {
      toast.error(t('pleaseEnterValidNumber'));
      return;
    }

    const selectedType = measurementTypes.find(type => type.value === newMeasurement.type);
    if (!selectedType) return;

    const newEntry: Measurement = {
      id: Date.now().toString(),
      date: newMeasurement.date,
      type: selectedType.label,
      value: value,
      unit: selectedType.unit
    };

    setMeasurements([...measurements, newEntry]);
    setNewMeasurement({
      type: 'weight',
      value: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowAddDialog(false);
    toast.success('Measurement added successfully');
  };

  const handleDeleteMeasurement = () => {
    if (measurementToDelete) {
      const updatedMeasurements = measurements.filter(
        measurement => measurement.id !== measurementToDelete
      );
      setMeasurements(updatedMeasurements);
      toast.success('Measurement deleted successfully');
      setShowDeleteDialog(false);
      setMeasurementToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setMeasurementToDelete(id);
    setShowDeleteDialog(true);
  };

  // Group measurements by type
  const groupedMeasurements = measurements.reduce((acc, measurement) => {
    if (!acc[measurement.type]) {
      acc[measurement.type] = [];
    }
    acc[measurement.type].push(measurement);
    return acc;
  }, {} as Record<string, Measurement[]>);

  return (
    <div className="space-y-6">
      {measurements.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{t('bodyMeasurements')}</h2>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addMeasurement')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('addMeasurement')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('type')}</label>
                    <Select 
                      value={newMeasurement.type}
                      onValueChange={(value) => setNewMeasurement({...newMeasurement, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select measurement type" />
                      </SelectTrigger>
                      <SelectContent>
                        {measurementTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} ({type.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('value')}</label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={newMeasurement.value}
                      onChange={(e) => setNewMeasurement({...newMeasurement, value: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('date')}</label>
                    <Input 
                      type="date" 
                      value={newMeasurement.date}
                      onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMeasurement}>{t('add')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedMeasurements).map(([type, typesMeasurements]) => (
              <div key={type} className="glassy-card rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-medium tracking-tight">{type}</h3>
                </div>
                <div className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('value')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typesMeasurements.map((measurement) => (
                        <TableRow key={measurement.id}>
                          <TableCell>{format(new Date(measurement.date), 'PP')}</TableCell>
                          <TableCell>
                            {measurement.value} {measurement.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(measurement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">{t('noMeasurementsYet')}</h3>
          <p className="text-muted-foreground mb-6">
            Start tracking your body measurements to see your progress over time.
          </p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('addFirstMeasurement')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addMeasurement')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('type')}</label>
                  <Select 
                    value={newMeasurement.type}
                    onValueChange={(value) => setNewMeasurement({...newMeasurement, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select measurement type" />
                    </SelectTrigger>
                    <SelectContent>
                      {measurementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('value')}</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={newMeasurement.value}
                    onChange={(e) => setNewMeasurement({...newMeasurement, value: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('date')}</label>
                  <Input 
                    type="date" 
                    value={newMeasurement.date}
                    onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMeasurement}>{t('add')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteMeasurement')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteMeasurement')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMeasurement}>
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

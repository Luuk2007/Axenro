
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlannedWorkouts } from '@/hooks/usePlannedWorkouts';
import { toast } from 'sonner';

interface PlanWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkoutPlanned: () => void;
}

const PlanWorkoutDialog = ({ open, onOpenChange, onWorkoutPlanned }: PlanWorkoutDialogProps) => {
  const { t } = useLanguage();
  const { addPlannedWorkout } = usePlannedWorkouts();
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    addPlannedWorkout({
      name,
      date: format(date, 'yyyy-MM-dd'),
      muscle_groups: [],
      notes
    });

    onWorkoutPlanned();
    onOpenChange(false);
    
    // Reset form
    setName('');
    setDate(undefined);
    setNotes('');
  };

  const handleCancel = () => {
    setName('');
    setDate(undefined);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Training Plannen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name">{t("Workout name")}</Label>
            <Input
              id="workout-name"
              placeholder="e.g., Push Day, Pull Day, Legs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Selecteer datum'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notities (optioneel)</Label>
            <Input
              id="notes"
              placeholder="Extra informatie..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleSave}>
              Plannen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanWorkoutDialog;

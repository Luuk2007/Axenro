import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface DuplicateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDuplicate: (newDate: string) => void;
  workoutName: string;
}

const DuplicateWorkoutDialog: React.FC<DuplicateWorkoutDialogProps> = ({
  open,
  onOpenChange,
  onConfirmDuplicate,
  workoutName,
}) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleConfirm = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    onConfirmDuplicate(formattedDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("duplicateWorkout")}</DialogTitle>
          <DialogDescription>
            {t("selectNewDateForWorkout")}: <strong>{workoutName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm}>
            {t("duplicate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateWorkoutDialog;

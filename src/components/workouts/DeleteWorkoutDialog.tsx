
import React from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteWorkoutDialogProps {
  workoutId: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteWorkoutDialog: React.FC<DeleteWorkoutDialogProps> = ({
  workoutId,
  onOpenChange,
  onConfirmDelete
}) => {
  const { t } = useLanguage();

  return (
    <AlertDialog 
      open={!!workoutId} 
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete workout")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("Confirm delete workout")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive text-destructive-foreground">
            {t("Delete workout")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWorkoutDialog;

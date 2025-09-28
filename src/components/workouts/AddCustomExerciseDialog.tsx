
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { toast } from "sonner";

interface AddCustomExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomExerciseAdded: (exercise: { id: string; name: string; muscleGroup: string }) => void;
  preselectedMuscleGroup?: string;
}

const muscleGroups = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'
];

const AddCustomExerciseDialog: React.FC<AddCustomExerciseDialogProps> = ({
  open,
  onOpenChange,
  onCustomExerciseAdded,
  preselectedMuscleGroup
}) => {
  const { t } = useLanguage();
  const { addCustomExercise } = useCustomExercises();
  const [exerciseName, setExerciseName] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(preselectedMuscleGroup || '');

  React.useEffect(() => {
    if (preselectedMuscleGroup) {
      setSelectedMuscleGroup(preselectedMuscleGroup);
    }
  }, [preselectedMuscleGroup]);

  const handleSave = async () => {
    if (!exerciseName.trim()) {
      toast.error("Please enter an exercise name");
      return;
    }

    if (!selectedMuscleGroup) {
      toast.error("Please select a muscle group");
      return;
    }

    // Create new exercise using the hook
    const newExercise = await addCustomExercise({
      name: exerciseName.trim(),
      muscleGroup: selectedMuscleGroup
    });

    if (newExercise) {
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('exercisesChanged'));
      
      // Notify parent component
      onCustomExerciseAdded(newExercise);
      
      toast.success("Custom exercise added successfully");
      
      // Reset form
      setExerciseName('');
      setSelectedMuscleGroup(preselectedMuscleGroup || '');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setExerciseName('');
    setSelectedMuscleGroup(preselectedMuscleGroup || '');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Exercise</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exercise Name</label>
            <Input
              placeholder="Enter exercise name"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Muscle Group</label>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!exerciseName.trim() || !selectedMuscleGroup}>
            Add Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomExerciseDialog;

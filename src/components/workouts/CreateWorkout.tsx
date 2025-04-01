
// Import section
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Save } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import AddExerciseDialog from "./AddExerciseDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workout: Workout) => void;
}

const CreateWorkout: React.FC<CreateWorkoutProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const { t } = useLanguage();
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Array<{
    id: string;
    name: string;
    sets: Array<{
      id: string;
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }>>([]);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleAddExercise = (exerciseName: string) => {
    const newExercise = {
      id: uuidv4(),
      name: exerciseName,
      sets: [
        {
          id: uuidv4(),
          reps: 10,
          weight: 20,
          completed: false
        }
      ]
    };
    setExercises([...exercises, newExercise]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      id: uuidv4(),
      reps: 10,
      weight: 20,
      completed: false
    });
    setExercises(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) {
      alert(t("fillAllFields"));
      return;
    }

    if (exercises.length === 0) {
      alert(t("noExercisesError"));
      return;
    }

    const newWorkout: Workout = {
      id: uuidv4(),
      name: workoutName,
      date: date.toISOString(),
      exercises: exercises,
      completed: false
    };

    onSave(newWorkout);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setWorkoutName("");
    setExercises([]);
    setDate(new Date());
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("createWorkout")}</DialogTitle>
            <DialogDescription>
              {t("selectExercises")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Input
                placeholder={t("workoutName")}
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
              
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t("date")}
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>{t("pickDate")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date || new Date());
                        setCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {exercises.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="border rounded-md p-4">
                <h4 className="font-medium mb-2">{exercise.name}</h4>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="grid grid-cols-3 gap-4 mb-2">
                    <div className="flex items-center">
                      <span className="w-8">{setIndex + 1}</span>
                      <Input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, "reps", parseInt(e.target.value) || 0)}
                        className="w-full"
                        placeholder={t("reps")}
                      />
                    </div>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={set.weight}
                        onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, "weight", parseInt(e.target.value) || 0)}
                        className="w-full"
                        placeholder={t("weightLifted")}
                      />
                      <span className="ml-2 text-sm">{t("kg")}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                      disabled={exercise.sets.length === 1}
                    >
                      -
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAddSet(exerciseIndex)}
                >
                  {t("addSet")}
                </Button>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed"
              onClick={() => setAddExerciseOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addExercise")}
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveWorkout}>
              <Save className="h-4 w-4 mr-2" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddExerciseDialog
        open={addExerciseOpen}
        onOpenChange={setAddExerciseOpen}
        onAddExercise={handleAddExercise}
      />
    </>
  );
};

export default CreateWorkout;


import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { 
  convertWeight, 
  convertHeight, 
  getWeightUnit, 
  getHeightUnit, 
  formatWeight, 
  formatHeight 
} from '@/utils/unitConversions';

const profileSchema = z.object({
  weight: z.number().min(1, 'Weight must be greater than 0'),
  height: z.number().min(1, 'Height must be greater than 0'),
  age: z.number().min(1, 'Age must be greater than 0'),
  gender: z.enum(['male', 'female', 'other']),
  goal: z.enum(['gain', 'lose', 'maintain']),
  exerciseFrequency: z.enum(['0-1', '2-3', '4-5', '6+']),
  targetWeight: z.number().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const defaultValues: ProfileFormValues = {
  weight: 70,
  height: 175,
  age: 30,
  gender: 'male',
  goal: 'maintain',
  exerciseFrequency: '2-3',
  targetWeight: 70,
};

export const emptyDefaultValues: Partial<ProfileFormValues> = {
  weight: 0,
  height: 0,
  age: 0,
  gender: 'male',
  goal: 'maintain',
  exerciseFrequency: '0-1',
  targetWeight: 0,
};

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void;
  initialValues?: Partial<ProfileFormValues>;
  isNewUser?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  onSubmit,
  initialValues = emptyDefaultValues,
  isNewUser = true,
}) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: isNewUser ? defaultValues : (initialValues as ProfileFormValues),
  });

  const goal = watch('goal');
  const weightUnit = getWeightUnit(measurementSystem);
  const heightUnit = getHeightUnit(measurementSystem);

  // Convert stored metric values to display values based on measurement system
  const getDisplayWeight = (metricWeight: number) => {
    if (!metricWeight) return '';
    const converted = convertWeight(metricWeight, 'metric', measurementSystem);
    return formatWeight(converted, measurementSystem);
  };

  const getDisplayHeight = (metricHeight: number) => {
    if (!metricHeight) return '';
    const converted = convertHeight(metricHeight, 'metric', measurementSystem);
    return formatHeight(converted, measurementSystem);
  };

  // Convert display values back to metric for storage
  const convertToMetric = (data: ProfileFormValues): ProfileFormValues => {
    return {
      ...data,
      weight: convertWeight(data.weight, measurementSystem, 'metric'),
      height: convertHeight(data.height, measurementSystem, 'metric'),
      targetWeight: data.targetWeight ? convertWeight(data.targetWeight, measurementSystem, 'metric') : undefined,
    };
  };

  const handleFormSubmit = (data: ProfileFormValues) => {
    const metricData = convertToMetric(data);
    onSubmit(metricData);
  };

  // Update form values when measurement system changes
  useEffect(() => {
    if (initialValues.weight && initialValues.height) {
      const displayWeight = convertWeight(initialValues.weight, 'metric', measurementSystem);
      const displayHeight = convertHeight(initialValues.height, 'metric', measurementSystem);
      const displayTargetWeight = initialValues.targetWeight ? 
        convertWeight(initialValues.targetWeight, 'metric', measurementSystem) : undefined;

      setValue('weight', parseFloat(formatWeight(displayWeight, measurementSystem)));
      setValue('height', parseFloat(formatHeight(displayHeight, measurementSystem)));
      if (displayTargetWeight) {
        setValue('targetWeight', parseFloat(formatWeight(displayTargetWeight, measurementSystem)));
      }
    }
  }, [measurementSystem, initialValues, setValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">{t("personalInformation")}</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight">{t("weight")} ({weightUnit})</Label>
              <Input
                id="weight"
                type="number"
                step={measurementSystem === 'imperial' ? '0.1' : '0.1'}
                {...register('weight', { valueAsNumber: true })}
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="height">{t("height")} ({heightUnit})</Label>
              <Input
                id="height"
                type="number"
                step={measurementSystem === 'imperial' ? '0.1' : '1'}
                {...register('height', { valueAsNumber: true })}
                className={errors.height ? 'border-red-500' : ''}
              />
              {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="age">{t("age")}</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                className={errors.age ? 'border-red-500' : ''}
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
            </div>
          </div>
        </Card>

        {/* Goals and Activity */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">{t("goalsAndActivity")}</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-3 block">{t("gender")}</Label>
              <RadioGroup
                defaultValue={watch('gender')}
                onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">{t("male")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">{t("female")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">{t("other")}</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="goal" className="text-base font-medium">{t("goal")}</Label>
              <Select
                value={watch('goal')}
                onValueChange={(value) => setValue('goal', value as 'gain' | 'lose' | 'maintain')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectGoal")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gain">{t("gainWeight")}</SelectItem>
                  <SelectItem value="lose">{t("loseWeight")}</SelectItem>
                  <SelectItem value="maintain">{t("maintainWeight")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {goal && goal !== "maintain" && (
              <div>
                <Label htmlFor="targetWeight">{t("targetWeight")} ({weightUnit})</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step={measurementSystem === 'imperial' ? '0.1' : '0.1'}
                  {...register('targetWeight', { valueAsNumber: true })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="exerciseFrequency" className="text-base font-medium">{t("exerciseFrequency")}</Label>
              <Select
                value={watch('exerciseFrequency')}
                onValueChange={(value) => setValue('exerciseFrequency', value as '0-1' | '2-3' | '4-5' | '6+')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectFrequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 {t("times")} {t("perWeek")}</SelectItem>
                  <SelectItem value="2-3">2-3 {t("times")} {t("perWeek")}</SelectItem>
                  <SelectItem value="4-5">4-5 {t("times")} {t("perWeek")}</SelectItem>
                  <SelectItem value="6+">6+ {t("times")} {t("perWeek")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      <Button type="submit" className="w-full">
        {isNewUser ? t("createProfile") : t("updateProfile")}
      </Button>
    </form>
  );
};

export default ProfileForm;


import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.number().min(1).max(120),
  weight: z.number().min(1).max(1000),
  height: z.number().min(1).max(300),
  gender: z.string().min(1, "Gender is required"),
  goal: z.string().min(1, "Goal is required"),
  exerciseFrequency: z.string().min(1, "Exercise frequency is required"),
  targetWeight: z.number().optional(),
});

export type ProfileFormValues = z.infer<typeof formSchema>;

export const defaultValues: ProfileFormValues = {
  fullName: "",
  age: 25,
  weight: 70,
  height: 170,
  gender: "male",
  goal: "maintain",
  exerciseFrequency: "3-4",
  targetWeight: undefined,
};

export const emptyDefaultValues: Partial<ProfileFormValues> = {
  fullName: "",
  age: 0,
  weight: 0,
  height: 0,
  gender: "",
  goal: "",
  exerciseFrequency: "",
  targetWeight: undefined,
};

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void;
  initialValues: Partial<ProfileFormValues>;
  isNewUser: boolean;
}

const ProfileForm = ({ onSubmit, initialValues, isNewUser }: ProfileFormProps) => {
  const { t } = useLanguage();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isNewUser ? defaultValues : { ...defaultValues, ...initialValues },
  });

  useEffect(() => {
    if (!isNewUser && initialValues) {
      const formValues = { ...defaultValues, ...initialValues };
      Object.keys(formValues).forEach((key) => {
        const typedKey = key as keyof ProfileFormValues;
        form.setValue(typedKey, formValues[typedKey]);
      });
    }
  }, [initialValues, isNewUser, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Full name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("Enter your full name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Age")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("Enter your age")}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Weight")} (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={t("Enter your weight")}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Height")} (cm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t("Enter your height")}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Gender")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select your gender")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">{t("Male")}</SelectItem>
                  <SelectItem value="female">{t("Female")}</SelectItem>
                  <SelectItem value="other">{t("Other")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Fitness goal")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select your fitness goal")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lose">{t("Lose weight")}</SelectItem>
                  <SelectItem value="maintain">{t("Maintain weight")}</SelectItem>
                  <SelectItem value="gain">{t("Gain weight")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exerciseFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Exercise frequency")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("How often do you exercise?")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-1">{t("0-1 times per week")}</SelectItem>
                  <SelectItem value="2-3">{t("2-3 times per week")}</SelectItem>
                  <SelectItem value="4-5">{t("4-5 times per week")}</SelectItem>
                  <SelectItem value="6+">{t("6+ times per week")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(form.watch("goal") === "lose" || form.watch("goal") === "gain") && (
          <FormField
            control={form.control}
            name="targetWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Target weight")} (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={t("Enter your target weight")}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          {t("Save profile")}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;

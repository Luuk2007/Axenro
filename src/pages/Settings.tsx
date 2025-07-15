
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface UserSettings {
  theme: "light" | "dark" | "system";
  language: Language;
  notifications: boolean;
  dataBackup: boolean;
}

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    language: "english",
    notifications: true,
    dataBackup: false,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: UserSettings) => {
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  // Handle theme change
  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    const newSettings = { ...settings, theme };
    saveSettings(newSettings);

    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System theme
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    toast.success(t("settingsSaved"));
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: Language) => {
    const newSettings = { ...settings, language: newLanguage };
    saveSettings(newSettings);
    setLanguage(newLanguage);
    toast.success(t("settingsSaved"));
  };

  // Handle notifications toggle
  const handleNotificationsChange = (notifications: boolean) => {
    const newSettings = { ...settings, notifications };
    saveSettings(newSettings);
    toast.success(t("settingsSaved"));
  };

  // Handle data backup toggle
  const handleDataBackupChange = (dataBackup: boolean) => {
    const newSettings = { ...settings, dataBackup };
    saveSettings(newSettings);
    toast.success(t("settingsSaved"));
  };

  // Export user data
  const exportData = () => {
    const userData = {
      profile: localStorage.getItem("userProfile"),
      measurements: localStorage.getItem("measurements"),
      weightData: localStorage.getItem("weightData"),
      workouts: localStorage.getItem("workouts"),
      nutritionData: localStorage.getItem("nutritionData"),
      settings: localStorage.getItem("userSettings"),
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "progresa-data-export.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success(t("dataExported"));
  };

  // Clear all user data
  const clearAllData = () => {
    if (window.confirm(t("confirmClearData"))) {
      localStorage.clear();
      toast.success(t("dataCleared"));
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("settings")}</h1>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">{t("theme")}</Label>
              <Select
                value={settings.theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("light")}</SelectItem>
                  <SelectItem value="dark">{t("dark")}</SelectItem>
                  <SelectItem value="system">{t("system")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="language">{t("language")}</Label>
              <Select
                value={settings.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="dutch">Nederlands</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("notifications")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">{t("Enable Notifications")}</Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Data Management")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dataBackup">{t("Auto Backup")}</Label>
              <Switch
                id="dataBackup"
                checked={settings.dataBackup}
                onCheckedChange={handleDataBackupChange}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={exportData} variant="outline">
                {t("Export data")}
              </Button>
              <Button onClick={clearAllData} variant="destructive">
                {t("Clear all data")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

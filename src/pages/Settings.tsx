
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import MealsSettings from "@/components/settings/MealsSettings";
import ExercisesSettings from "@/components/settings/ExercisesSettings";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { useSearchParams } from "react-router-dom";

interface UserSettings {
  theme: "light" | "dark" | "system";
  language: Language;
  notifications: boolean;
  dataBackup: boolean;
}

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { subscribed, subscription_tier, subscription_end, openCustomerPortal, loading } = useSubscription();
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    language: "english",
    notifications: true,
    dataBackup: false,
  });
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
    }

    // Check if subscription tab should be opened
    const tab = searchParams.get('tab');
    if (tab === 'subscription') {
      setSubscriptionOpen(true);
    }
  }, [searchParams]);

  // Save settings to localStorage and dispatch custom event
  const saveSettings = (newSettings: UserSettings) => {
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
    setSettings(newSettings);
    
    // Dispatch custom event to notify other components about settings change
    window.dispatchEvent(new CustomEvent('settingsChanged'));
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
    toast.success(t("Settings saved"));
  };

  // Handle notifications toggle
  const handleNotificationsChange = (notifications: boolean) => {
    const newSettings = { ...settings, notifications };
    saveSettings(newSettings);
    toast.success(t("Settings saved"));
  };

  // Handle data backup toggle
  const handleDataBackupChange = (dataBackup: boolean) => {
    const newSettings = { ...settings, dataBackup };
    saveSettings(newSettings);
    toast.success(t("Settings saved"));
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
      customMeals: localStorage.getItem("customMeals"),
      customExercises: localStorage.getItem("customExercises"),
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

  const handleManageSubscription = async () => {
    if (!subscribed) {
      setSubscriptionModalOpen(true);
      return;
    }

    try {
      await openCustomerPortal();
      toast.success(t("Opening customer portal..."));
    } catch (error) {
      console.error('Portal error:', error);
      toast.error(t("Failed to open customer portal"));
    }
  };

  const formatNextBillingDate = () => {
    if (!subscription_end) return "";
    const date = new Date(subscription_end);
    return date.toLocaleDateString(language === 'dutch' ? 'nl-NL' : 'en-US');
  };

  const getSubscriptionAmount = () => {
    if (!subscribed) return "";
    if (subscription_tier === "Pro") return "€4.99";
    if (subscription_tier === "Premium") return "€7.99";
    return "";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("settings")}</h1>
      </div>

      <div className="grid gap-3">
        {/* Appearance Settings */}
        <Card>
          <Collapsible open={appearanceOpen} onOpenChange={setAppearanceOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t("Appearance")}</CardTitle>
                  {appearanceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 py-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme" className="text-sm">{t("theme")}</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={handleThemeChange}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
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
                  <Label htmlFor="language" className="text-sm">{t("language")}</Label>
                  <Select
                    value={settings.language}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="dutch">Nederlands</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Meals Settings */}
        <MealsSettings />

        {/* Exercises Settings */}
        <ExercisesSettings />

        {/* Notification Settings */}
        <Card>
          <Collapsible open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t("notifications")}</CardTitle>
                  {notificationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 py-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm">{t("Enable Notifications")}</Label>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={handleNotificationsChange}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Subscription Management */}
        <Card>
          <Collapsible open={subscriptionOpen} onOpenChange={setSubscriptionOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t("Subscription Management")}</CardTitle>
                  {subscriptionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 py-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t("Current subscription")}</Label>
                    <span className="text-sm font-medium">
                      {loading ? t("Loading...") : (subscribed ? `${subscription_tier} ${t("Plan")}` : t("Free Plan"))}
                    </span>
                  </div>
                  
                  {subscribed && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{t("Amount")}</Label>
                        <span className="text-sm font-medium">
                          {getSubscriptionAmount()} {t("per month")}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{t("Next billing date")}</Label>
                        <span className="text-sm font-medium">
                          {formatNextBillingDate()}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {!subscribed && (
                    <p className="text-sm text-muted-foreground">
                      {t("You are currently on the free plan")}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={handleManageSubscription} disabled={loading}>
                    {subscribed ? t("Manage billing") : t("Upgrade")}
                  </Button>
                  {subscribed && (
                    <Button size="sm" variant="outline" onClick={handleManageSubscription}>
                      {t("View subscription details")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Data Management */}
        <Card>
          <Collapsible open={dataManagementOpen} onOpenChange={setDataManagementOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t("Data Management")}</CardTitle>
                  {dataManagementOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 py-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataBackup" className="text-sm">{t("Auto Backup")}</Label>
                  <Switch
                    id="dataBackup"
                    checked={settings.dataBackup}
                    onCheckedChange={handleDataBackupChange}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={exportData} variant="outline">
                    {t("Export data")}
                  </Button>
                  <Button size="sm" onClick={clearAllData} variant="destructive">
                    {t("Clear all data")}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      <SubscriptionModal 
        open={subscriptionModalOpen} 
        onOpenChange={setSubscriptionModalOpen} 
      />
    </div>
  );
};

export default Settings;

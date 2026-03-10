
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, Ruler, Dumbbell, BarChart3, UtensilsCrossed, Cookie, 
  CreditCard, Database, ArrowRight, ArrowLeft, Crown
} from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import MealsSettings from "@/components/settings/MealsSettings";
import ExercisesSettings from "@/components/settings/ExercisesSettings";
import BodyMeasurementsSettings from "@/components/settings/BodyMeasurementsSettings";
import MeasurementSystemSettings from "@/components/settings/MeasurementSystemSettings";
import CookieSettings from "@/components/settings/CookieSettings";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface UserSettings {
  theme: "light" | "dark" | "system";
  language: Language;
  dataBackup: boolean;
}

type SettingsPanel = null | 'appearance' | 'measurement' | 'exercises' | 'bodyMeasurements' | 'meals' | 'cookies' | 'subscription' | 'data';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  iconBg?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon, title, description, onClick, iconBg = "bg-primary/10" }) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left w-full group"
  >
    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
  </motion.button>
);

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { subscribed, subscription_tier, subscription_end, openCustomerPortal, loading } = useSubscription();
  const location = useLocation();
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    language: language,
    dataBackup: false,
  });
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'subscription') setActivePanel('subscription');
  }, [location.search]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({ ...parsedSettings, language });
    } else {
      setSettings(prev => ({ ...prev, language }));
    }
  }, [language]);

  useEffect(() => {
    const handleSettingsChange = () => {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, theme: parsedSettings.theme || "light" }));
        } catch (error) {
          console.error("Error parsing settings:", error);
        }
      }
    };
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
    setSettings(newSettings);
    window.dispatchEvent(new CustomEvent('settingsChanged'));
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    const newSettings = { ...settings, theme };
    saveSettings(newSettings);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else if (theme === "light") document.documentElement.classList.remove("dark");
    else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
    toast.success(t("settingsSaved"));
  };

  const handleLanguageChange = (newLanguage: Language) => {
    const newSettings = { ...settings, language: newLanguage };
    saveSettings(newSettings);
    setLanguage(newLanguage);
    toast.success(t("Settings saved"));
  };

  const handleDataBackupChange = (dataBackup: boolean) => {
    const newSettings = { ...settings, dataBackup };
    saveSettings(newSettings);
    toast.success(t("Settings saved"));
  };

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
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "progresa-data-export.json");
    linkElement.click();
    toast.success(t("dataExported"));
  };

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
    } catch (error: any) {
      console.error('Portal error:', error);
      if (error?.message === 'NO_STRIPE_CUSTOMER') {
        toast.error(t("No active Stripe subscription found. Please subscribe first."));
        setSubscriptionModalOpen(true);
      } else {
        toast.error(t("Failed to open customer portal"));
      }
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

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'appearance':
        return (
          <div className="space-y-6">
            {subscribed && (
              <div className="space-y-2">
                <Label htmlFor="theme">{t("theme")}</Label>
                <Select value={settings.theme || "light"} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("theme")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("light")}</SelectItem>
                    <SelectItem value="dark">{t("dark")}</SelectItem>
                    <SelectItem value="system">{t("system")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="language">{t("language")}</Label>
              <Select value={settings.language || language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="dutch">Nederlands</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'measurement':
        return <MeasurementSystemSettings embedded />;
      case 'exercises':
        return <ExercisesSettings embedded />;
      case 'bodyMeasurements':
        return <BodyMeasurementsSettings embedded />;
      case 'meals':
        return <MealsSettings embedded />;
      case 'cookies':
        return <CookieSettings embedded />;
      case 'subscription':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("Current subscription")}</Label>
                <span className="text-sm font-medium">
                  {loading ? t("Loading...") : (subscribed ? `${subscription_tier} ${t("Plan")}` : t("Free Plan"))}
                </span>
              </div>
              {subscribed && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>{t("Amount")}</Label>
                    <span className="text-sm font-medium">{getSubscriptionAmount()} {t("per month")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("Next billing date")}</Label>
                    <span className="text-sm font-medium">{formatNextBillingDate()}</span>
                  </div>
                </>
              )}
              {!subscribed && (
                <p className="text-sm text-muted-foreground">{t("You are currently on the free plan")}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={handleManageSubscription} disabled={loading}>
                {subscribed ? t("Manage billing") : t("Upgrade")}
              </Button>
              {subscribed && (
                <Button size="sm" variant="outline" onClick={handleManageSubscription}>
                  {t("View subscription details")}
                </Button>
              )}
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dataBackup">{t("Auto Backup")}</Label>
              <Switch id="dataBackup" checked={settings.dataBackup} onCheckedChange={handleDataBackupChange} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={exportData} variant="outline">{t("Export data")}</Button>
              <Button size="sm" onClick={clearAllData} variant="destructive">{t("Clear all data")}</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const panelTitles: Record<string, string> = {
    appearance: t("Appearance"),
    measurement: t("Measurement system"),
    exercises: t("Exercises"),
    bodyMeasurements: t("Body measurements"),
    meals: t("Meals"),
    cookies: t("Cookie preferences"),
    subscription: t("Subscription Management"),
    data: t("Data Management"),
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          {activePanel ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setActivePanel(null)} className="h-8 w-8 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{panelTitles[activePanel]}</h1>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{t("settings")}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{t("Customize your app preferences")}</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activePanel ? (
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            {renderPanelContent()}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* General Settings */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("General settings")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SettingsCard
                  icon={<Palette className="h-5 w-5 text-primary" />}
                  title={t("Appearance")}
                  description={t("Theme and language preferences")}
                  onClick={() => setActivePanel('appearance')}
                  iconBg="bg-primary/10"
                />
                <SettingsCard
                  icon={<Ruler className="h-5 w-5 text-emerald-600" />}
                  title={t("Measurement system")}
                  description={t("Choose between kg/lbs and cm/inches")}
                  onClick={() => setActivePanel('measurement')}
                  iconBg="bg-emerald-500/10"
                />
                <SettingsCard
                  icon={<Dumbbell className="h-5 w-5 text-orange-600" />}
                  title={t("Exercises")}
                  description={t("Manage custom exercises and muscles")}
                  onClick={() => setActivePanel('exercises')}
                  iconBg="bg-orange-500/10"
                />
                <SettingsCard
                  icon={<BarChart3 className="h-5 w-5 text-violet-600" />}
                  title={t("Body measurements")}
                  description={t("Configure which measurements to track")}
                  onClick={() => setActivePanel('bodyMeasurements')}
                  iconBg="bg-violet-500/10"
                />
              </div>
            </div>

            {/* Nutrition */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("Nutrition")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SettingsCard
                  icon={<UtensilsCrossed className="h-5 w-5 text-amber-600" />}
                  title={t("Meals")}
                  description={t("Set default meal categories")}
                  onClick={() => setActivePanel('meals')}
                  iconBg="bg-amber-500/10"
                />
                <SettingsCard
                  icon={<Cookie className="h-5 w-5 text-rose-600" />}
                  title={t("Cookie preferences")}
                  description={t("Manage tracking and analytics cookies")}
                  onClick={() => setActivePanel('cookies')}
                  iconBg="bg-rose-500/10"
                />
              </div>
            </div>

            {/* Account */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("Account")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SettingsCard
                  icon={<CreditCard className="h-5 w-5 text-sky-600" />}
                  title={t("Subscription Management")}
                  description={t("Manage your Axenro subscription")}
                  onClick={() => setActivePanel('subscription')}
                  iconBg="bg-sky-500/10"
                />
                <SettingsCard
                  icon={<Database className="h-5 w-5 text-slate-600" />}
                  title={t("Data Management")}
                  description={t("Export or delete your data")}
                  onClick={() => setActivePanel('data')}
                  iconBg="bg-slate-500/10"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubscriptionModal 
        open={subscriptionModalOpen} 
        onOpenChange={setSubscriptionModalOpen} 
      />
    </div>
  );
};

export default Settings;

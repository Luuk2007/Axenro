
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity, Smartphone, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface HealthAppConnectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HealthAppConnector({ isOpen, onClose }: HealthAppConnectorProps) {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if health app is already connected from localStorage
    const healthAppSettings = localStorage.getItem("healthAppSettings");
    if (healthAppSettings) {
      const { connected, app } = JSON.parse(healthAppSettings);
      setIsConnected(connected);
      setSelectedApp(app);
    }
  }, []);

  const healthApps = [
    { id: "appleHealth", name: t("appleHealth"), icon: <Activity className="h-6 w-6 text-primary" /> },
    { id: "googleFit", name: t("googleFit"), icon: <Activity className="h-6 w-6 text-emerald-500" /> },
    { id: "fitbit", name: t("fitbit"), icon: <Activity className="h-6 w-6 text-blue-500" /> },
    { id: "samsung", name: t("samsung"), icon: <Activity className="h-6 w-6 text-indigo-500" /> },
  ];

  const handleConnect = async (appId: string) => {
    setIsConnecting(true);
    
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock health app connection
      // In a real app, this would interact with the health app's API
      const appName = healthApps.find(app => app.id === appId)?.name;
      
      // Save connection status to localStorage
      localStorage.setItem("healthAppSettings", JSON.stringify({
        connected: true,
        app: appId,
        lastSync: new Date().toISOString()
      }));
      
      // Update UI state
      setIsConnected(true);
      setSelectedApp(appId);
      
      // Show success toast
      toast.success(`${appName} ${t("success")} ${t("connect")}!`);
      
      // Save some demo steps data
      const today = new Date().toISOString().split('T')[0];
      const stepsData = {
        date: today,
        steps: Math.floor(Math.random() * 5000) + 3000 // Random steps between 3000-8000
      };
      localStorage.setItem("healthStepsData", JSON.stringify(stepsData));
      
      // Close dialog after successful connection
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      toast.error(`${t("error")} ${t("connect")}`);
      console.error("Error connecting to health app:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // Remove health app settings from localStorage
    localStorage.removeItem("healthAppSettings");
    localStorage.removeItem("healthStepsData");
    
    // Update UI state
    setIsConnected(false);
    setSelectedApp(null);
    
    // Show success toast
    toast.success(t("disconnect") + " " + t("success"));
    
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("healthApps")}</DialogTitle>
          <DialogDescription>
            {t("connectHealth")}
          </DialogDescription>
        </DialogHeader>
        
        {isConnected ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-center font-medium">
              {healthApps.find(app => app.id === selectedApp)?.name} {t("connect")} {t("success")}
            </p>
            <div className="text-sm text-center text-muted-foreground">
              {t("lastSync")}: {new Date().toLocaleTimeString()}
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDisconnect}
            >
              {t("disconnect")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <p className="text-sm font-medium mb-2">{t("selectApp")}:</p>
            {healthApps.map((app) => (
              <Button
                key={app.id}
                variant="outline"
                className="justify-start"
                onClick={() => handleConnect(app.id)}
                disabled={isConnecting}
              >
                <div className="mr-2">{app.icon}</div>
                <span>{app.name}</span>
                {isConnecting && selectedApp === app.id && (
                  <div className="ml-auto spinner h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </Button>
            ))}
          </div>
        )}
        
        <DialogFooter className="sm:justify-start">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isConnecting}
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

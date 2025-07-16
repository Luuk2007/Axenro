
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Activity, Watch } from 'lucide-react';

interface StepsConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StepsConnectionModal({ open, onOpenChange }: StepsConnectionModalProps) {
  const handleConnectAppleHealth = () => {
    // TODO: Implement Apple Health connection
    console.log('Connecting to Apple Health...');
  };

  const handleConnectGoogleFit = () => {
    // TODO: Implement Google Fit connection
    console.log('Connecting to Google Fit...');
  };

  const handleConnectSamsungHealth = () => {
    // TODO: Implement Samsung Health connection
    console.log('Connecting to Samsung Health...');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Connect your steps</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sync your daily steps from your phone's health app.
          </p>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full h-14 flex items-center justify-start gap-3 text-left"
            onClick={handleConnectAppleHealth}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
              <Smartphone className="h-5 w-5 text-gray-600" />
            </div>
            <span className="font-medium">Connect with Apple Health</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-14 flex items-center justify-start gap-3 text-left"
            onClick={handleConnectGoogleFit}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-medium">Connect with Google Fit</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-14 flex items-center justify-start gap-3 text-left"
            onClick={handleConnectSamsungHealth}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
              <Watch className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium">Connect with Samsung Health</span>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          We use secure connections to sync your step data. You can disconnect at any time from your profile settings.
        </p>
      </DialogContent>
    </Dialog>
  );
}

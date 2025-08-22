import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StepsConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StepsConnectionModal({ open, onOpenChange }: StepsConnectionModalProps) {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && open) {
      checkConnection();
    }
  }, [user, open]);

  const checkConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('health_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google_fit')
        .eq('is_active', true)
        .single();

      setIsConnected(!!data && !error);
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    }
  };

  const handleConnectGoogleFit = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setIsConnecting(true);

    try {
      // Get current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Authentication required. Please sign in again.');
        setIsConnecting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-fit-auth', {
        body: { action: 'getAuthUrl' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error getting auth URL:', error);
        toast.error('Failed to start connection process');
        setIsConnecting(false);
        return;
      }

      if (!data?.authUrl) {
        console.error('No auth URL received');
        toast.error('Failed to get authorization URL');
        setIsConnecting(false);
        return;
      }

      console.log('Connecting to Google Fit...');
      
      // Always redirect in the same window for mobile compatibility
      // Store a flag to know we're in the middle of connecting
      localStorage.setItem('google_fit_connecting', 'true');
      window.location.href = data.authUrl;

    } catch (error) {
      console.error('Error connecting to Google Fit:', error);
      toast.error('Failed to connect to Google Fit');
      setIsConnecting(false);
    }
  };

  const handleSyncSteps = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setIsSyncing(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Authentication required. Please sign in again.');
        setIsSyncing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-google-fit-steps', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error syncing steps:', error);
        toast.error('Failed to sync steps data');
        return;
      }

      toast.success(data.message || 'Steps synced successfully!');
    } catch (error) {
      console.error('Error syncing steps:', error);
      toast.error('Failed to sync steps data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('health_connections')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', 'google_fit');

      if (error) {
        console.error('Error disconnecting:', error);
        toast.error('Failed to disconnect');
        return;
      }

      setIsConnected(false);
      toast.success('Disconnected from Google Fit');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Connect your steps</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sync your daily steps from Google Fit, which works with most step tracking apps on iOS and Android.
          </p>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {!isConnected ? (
            <Button
              variant="outline"
              className="w-full h-14 flex items-center justify-start gap-3 text-left"
              onClick={handleConnectGoogleFit}
              disabled={isConnecting || !user}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">
                {isConnecting ? 'Connecting...' : 'Connect with Google Fit'}
              </span>
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">Connected to Google Fit</p>
                  <p className="text-sm text-green-600">Your steps are being tracked</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSyncSteps}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Google Fit connects to most step tracking apps including iOS Health app, Samsung Health, and built-in step counters. 
          You can disconnect at any time from your profile settings.
        </p>
      </DialogContent>
    </Dialog>
  );
}

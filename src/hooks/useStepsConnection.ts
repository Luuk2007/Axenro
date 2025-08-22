
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StepData {
  date: string;
  steps: number;
  source: string;
}

export const useStepsConnection = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [recentSteps, setRecentSteps] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);

  const checkConnection = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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

  const fetchRecentSteps = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_steps')
        .select('date, steps, source')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      if (!error && data) {
        setRecentSteps(data);
      }
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  const getTodaySteps = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = recentSteps.find(step => step.date === today);
    return todayData?.steps || 0;
  };

  const getWeeklySteps = () => {
    return recentSteps.reduce((total, day) => total + day.steps, 0);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await checkConnection();
      await fetchRecentSteps();
      setLoading(false);
    };

    init();
  }, [user]);

  // Listen for URL changes (for OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const wasConnecting = localStorage.getItem('google_fit_connecting');
    
    if (success === 'connected' && wasConnecting) {
      console.log('Google Fit connection successful');
      toast.success('Successfully connected to Google Fit!');
      checkConnection();
      fetchRecentSteps();
      localStorage.removeItem('google_fit_connecting');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error && wasConnecting) {
      console.error('Google Fit connection error:', error);
      let errorMessage = 'Failed to connect to Google Fit';
      
      switch (error) {
        case 'auth_failed':
          errorMessage = 'Authorization was denied or failed';
          break;
        case 'missing_params':
          errorMessage = 'Missing required parameters';
          break;
        case 'token_failed':
          errorMessage = 'Failed to get access token';
          break;
        case 'config_error':
          errorMessage = 'Configuration error';
          break;
        case 'db_failed':
          errorMessage = 'Failed to save connection';
          break;
        case 'server_error':
          errorMessage = 'Server error occurred';
          break;
      }
      
      toast.error(errorMessage);
      localStorage.removeItem('google_fit_connecting');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return {
    isConnected,
    recentSteps,
    loading,
    getTodaySteps,
    getWeeklySteps,
    checkConnection,
    fetchRecentSteps
  };
};

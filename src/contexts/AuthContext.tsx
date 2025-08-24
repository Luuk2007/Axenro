import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';
import { waterTrackingService } from '@/services/waterTrackingService';
import { profileService } from '@/services/profileService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiting for auth attempts
const AUTH_RATE_LIMIT = 5; // max attempts
const AUTH_WINDOW = 15 * 60 * 1000; // 15 minutes

const getAuthAttempts = (): { count: number; timestamp: number } => {
  const stored = localStorage.getItem('auth_attempts');
  if (!stored) return { count: 0, timestamp: Date.now() };
  
  try {
    return JSON.parse(stored);
  } catch {
    return { count: 0, timestamp: Date.now() };
  }
};

const incrementAuthAttempts = () => {
  const current = getAuthAttempts();
  const now = Date.now();
  
  // Reset if window expired
  if (now - current.timestamp > AUTH_WINDOW) {
    localStorage.setItem('auth_attempts', JSON.stringify({ count: 1, timestamp: now }));
    return 1;
  }
  
  const newCount = current.count + 1;
  localStorage.setItem('auth_attempts', JSON.stringify({ count: newCount, timestamp: current.timestamp }));
  return newCount;
};

const resetAuthAttempts = () => {
  localStorage.removeItem('auth_attempts');
};

const isRateLimited = (): boolean => {
  const attempts = getAuthAttempts();
  const now = Date.now();
  
  if (now - attempts.timestamp > AUTH_WINDOW) {
    return false;
  }
  
  return attempts.count >= AUTH_RATE_LIMIT;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription status after auth state is set
      if (session?.user) {
        checkSubscriptionStatus(session);
        // Migrate localStorage data when user logs in
        migrateLocalStorageData();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check subscription status on auth change
      if (session?.user) {
        checkSubscriptionStatus(session);
        // Migrate localStorage data when user logs in
        setTimeout(() => {
          migrateLocalStorageData();
        }, 100);
      } else {
        // Clear any cached data when user logs out
        clearUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const migrateLocalStorageData = async () => {
    try {
      console.log('Migrating localStorage data to Supabase...');
      
      // Migrate water tracking data
      await waterTrackingService.migrateLocalStorageData();
      
      // Migrate profile data
      await profileService.migrateLocalStorageProfile();
      
      console.log('Data migration completed');
    } catch (error) {
      console.error('Error during data migration:', error);
    }
  };

  const clearUserData = () => {
    // Don't clear localStorage data when user logs out
    // Keep it as backup for unauthenticated usage
    console.log('User logged out - keeping localStorage data as backup');
  };

  const checkSubscriptionStatus = async (session: Session) => {
    try {
      await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check rate limiting
    if (isRateLimited()) {
      const error = new Error('Too many login attempts. Please try again in 15 minutes.');
      toast.error(error.message);
      return { error };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        incrementAuthAttempts();
        toast.error(error.message);
        return { error };
      }
      
      resetAuthAttempts();
      toast.success(t("loginSuccess"));
      navigate('/');
      return { error: null };
    } catch (error: any) {
      incrementAuthAttempts();
      toast.error(error.message);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Check rate limiting
    if (isRateLimited()) {
      const error = new Error('Too many signup attempts. Please try again in 15 minutes.');
      toast.error(error.message);
      return { error };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        incrementAuthAttempts();
        toast.error(error.message);
        return { error };
      }
      
      resetAuthAttempts();
      toast.success(t("signupSuccess"));
      toast.info(t("checkEmailConfirmation"));
      return { error: null };
    } catch (error: any) {
      incrementAuthAttempts();
      toast.error(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear sensitive data from localStorage
      const keysToRemove = ['auth_attempts', 'health_token_cache'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      await supabase.auth.signOut();
      toast.success(t("loggedOut"));
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetyourpassword`,
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success(t("resetEmailSent"));
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

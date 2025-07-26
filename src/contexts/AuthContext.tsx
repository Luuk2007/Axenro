
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';
import { SecurityUtils } from '@/utils/security';

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
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check subscription status on auth change
      if (session?.user) {
        checkSubscriptionStatus(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    try {
      // Sanitize and validate email input
      const sanitizedEmail = SecurityUtils.sanitizeText(email, 254).toLowerCase();
      if (!SecurityUtils.isValidEmail(sanitizedEmail)) {
        toast.error("Please enter a valid email address");
        return { error: new Error("Invalid email format") };
      }

      // Check rate limiting for sign-in attempts
      const emailKey = `signin_${sanitizedEmail}`;
      if (!SecurityUtils.checkRateLimit(emailKey, 5, 300000)) { // 5 attempts per 5 minutes
        SecurityUtils.logSecurityEvent('signin_rate_limit_exceeded', { email: sanitizedEmail });
        toast.error("Too many sign-in attempts. Please wait before trying again.");
        return { error: new Error("Rate limit exceeded") };
      }

      const { error } = await supabase.auth.signInWithPassword({ 
        email: sanitizedEmail, 
        password 
      });
      
      if (error) {
        SecurityUtils.logSecurityEvent('signin_failed', { 
          email: sanitizedEmail,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        });
        toast.error(error.message);
        return { error };
      }
      
      SecurityUtils.logSecurityEvent('signin_successful', { email: sanitizedEmail });
      toast.success(t("loginSuccess"));
      navigate('/');
      return { error: null };
    } catch (error: any) {
      SecurityUtils.logSecurityEvent('signin_error', { error: error.message });
      toast.error(error.message);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Sanitize and validate inputs
      const sanitizedEmail = SecurityUtils.sanitizeText(email, 254).toLowerCase();
      const sanitizedFullName = SecurityUtils.sanitizeText(fullName, 100);
      
      if (!SecurityUtils.isValidEmail(sanitizedEmail)) {
        toast.error("Please enter a valid email address");
        return { error: new Error("Invalid email format") };
      }

      if (!sanitizedFullName.trim()) {
        toast.error("Please enter your full name");
        return { error: new Error("Full name is required") };
      }

      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return { error: new Error("Password too short") };
      }

      // Check rate limiting for sign-up attempts
      const emailKey = `signup_${sanitizedEmail}`;
      if (!SecurityUtils.checkRateLimit(emailKey, 3, 3600000)) { // 3 attempts per hour
        SecurityUtils.logSecurityEvent('signup_rate_limit_exceeded', { email: sanitizedEmail });
        toast.error("Too many sign-up attempts. Please wait before trying again.");
        return { error: new Error("Rate limit exceeded") };
      }

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedFullName,
          },
        },
      });
      
      if (error) {
        SecurityUtils.logSecurityEvent('signup_failed', { 
          email: sanitizedEmail,
          errorMessage: error.message 
        });
        toast.error(error.message);
        return { error };
      }
      
      SecurityUtils.logSecurityEvent('signup_successful', { email: sanitizedEmail });
      toast.success(t("signupSuccess"));
      toast.info(t("checkEmailConfirmation"));
      return { error: null };
    } catch (error: any) {
      SecurityUtils.logSecurityEvent('signup_error', { error: error.message });
      toast.error(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const currentUser = user?.email;
      await supabase.auth.signOut();
      if (currentUser) {
        SecurityUtils.logSecurityEvent('signout_successful', { email: currentUser });
      }
      toast.success(t("loggedOut"));
      navigate('/');
    } catch (error: any) {
      SecurityUtils.logSecurityEvent('signout_error', { error: error.message });
      toast.error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Sanitize and validate email input
      const sanitizedEmail = SecurityUtils.sanitizeText(email, 254).toLowerCase();
      if (!SecurityUtils.isValidEmail(sanitizedEmail)) {
        toast.error("Please enter a valid email address");
        return { error: new Error("Invalid email format") };
      }

      // Check rate limiting for password reset attempts
      const emailKey = `reset_${sanitizedEmail}`;
      if (!SecurityUtils.checkRateLimit(emailKey, 3, 3600000)) { // 3 attempts per hour
        SecurityUtils.logSecurityEvent('password_reset_rate_limit_exceeded', { email: sanitizedEmail });
        toast.error("Too many password reset attempts. Please wait before trying again.");
        return { error: new Error("Rate limit exceeded") };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) {
        SecurityUtils.logSecurityEvent('password_reset_failed', { 
          email: sanitizedEmail,
          errorMessage: error.message 
        });
        toast.error(error.message);
        return { error };
      }
      
      SecurityUtils.logSecurityEvent('password_reset_requested', { email: sanitizedEmail });
      toast.success(t("resetEmailSent"));
      return { error: null };
    } catch (error: any) {
      SecurityUtils.logSecurityEvent('password_reset_error', { error: error.message });
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
        SecurityUtils.logSecurityEvent('google_signin_failed', { errorMessage: error.message });
        toast.error(error.message);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      SecurityUtils.logSecurityEvent('google_signin_error', { error: error.message });
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

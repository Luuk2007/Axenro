
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthenticationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function AuthenticationDialog({ 
  open, 
  onOpenChange,
  trigger 
}: AuthenticationDialogProps) {
  const { t } = useLanguage();
  const { signIn, signUp, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState("signin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error(t("fillAllFields"));
      return;
    }
    
    const { error } = await signIn(email, password);
    if (!error) {
      onOpenChange(false);
      resetForm();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password || !fullName || !confirmPassword) {
      toast.error(t("fillAllFields"));
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }
    
    const { error } = await signUp(email, password, fullName);
    if (!error) {
      onOpenChange(false);
      resetForm();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error(t("enterEmail"));
      return;
    }
    
    const { error } = await resetPassword(resetEmail);
    if (!error) {
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };
  
  // Switch to sign in tab
  const switchToSignIn = () => {
    setActiveTab("signin");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showForgotPassword ? t("resetPassword") : t("login")}</DialogTitle>
        </DialogHeader>
        {showForgotPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4 pt-4">
            <DialogDescription>{t("enterEmail")}</DialogDescription>
            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-medium">{t("email")}</label>
              <Input 
                id="reset-email" 
                type="email" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit">{t("send")}</Button>
            </div>
          </form>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">{t("email")}</label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="password" className="text-sm font-medium">{t("password")}</label>
                    <button 
                      type="button" 
                      className="text-xs text-primary hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">{t("signIn")}</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">{t("fullName")}</label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">{t("email")}</label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">{t("password")}</label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">{t("confirmPassword")}</label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">{t("signUp")}</Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t("alreadyHaveAccount")}{" "}
                  <button 
                    type="button" 
                    className="text-primary hover:underline"
                    onClick={switchToSignIn}
                  >
                    {t("signIn")}
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}


import React, { useState } from 'react';
import { BellIcon, Menu, LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function TopBar() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, signIn, signUp, signOut, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState("signin");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error(t("fillAllFields"));
      return;
    }
    
    const { error } = await signIn(email, password);
    if (!error) {
      setAuthDialogOpen(false);
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
      setAuthDialogOpen(false);
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
  
  // Get user initials from fullName
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return '';
    
    const fullName = user.user_metadata.full_name;
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return fullName.substring(0, 2).toUpperCase();
  };
  
  // Mark notifications as read when the notification dialog is opened
  const handleOpenNotifications = () => {
    setShowNotifications(true);
    setHasUnreadNotifications(false);
  };

  // Close mobile menu when navigating to a new page
  const handleNavigate = (path: string) => {
    navigate(path);
    // Close any open mobile sheets if needed
    const sheetElement = document.querySelector('[data-state="open"]');
    if (sheetElement) {
      const closeButton = sheetElement.querySelector('button[data-state]');
      if (closeButton) {
        (closeButton as HTMLButtonElement).click();
      }
    }
  };

  // Switch to sign in tab
  const switchToSignIn = () => {
    setActiveTab("signin");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent"
              onClick={handleOpenNotifications}
            >
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">{t("notifications")}</span>
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("notifications")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              <div className="flex items-start gap-4 border-b border-border pb-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <BellIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Workout Reminder</p>
                  <p className="text-sm text-muted-foreground">Your scheduled workout "Upper Body Strength" is due in 30 minutes.</p>
                  <p className="text-xs text-muted-foreground mt-1">Today, 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <BellIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Goal Reached!</p>
                  <p className="text-sm text-muted-foreground">Congratulations! You've reached your daily step goal of 10,000 steps.</p>
                  <p className="text-xs text-muted-foreground mt-1">Yesterday, 8:30 PM</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 overflow-hidden border border-border"
              >
                <span className="sr-only">User menu</span>
                <div className="h-full w-full bg-primary/10 text-xs font-medium flex items-center justify-center text-primary">
                  {getUserInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleNavigate('/profile')}>
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleNavigate('/settings')}>
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSignOut}>
                {t("logOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                {t("login")}
              </Button>
            </DialogTrigger>
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
        )}
      </div>
    </header>
  );
}

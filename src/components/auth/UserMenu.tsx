
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AuthenticationDialog from './AuthenticationDialog';

export default function UserMenu() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
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
        <AuthenticationDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen}
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              {t("login")}
            </Button>
          }
        />
      )}
    </>
  );
}

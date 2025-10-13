import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AuthenticationDialog from "./AuthenticationDialog";

export const LoginPrompt = () => {
  const { t } = useLanguage();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <Alert className="mb-4">
        <div className="flex items-center gap-3">
          <LogIn className="h-4 w-4 shrink-0" />
          <AlertDescription className="flex items-center justify-between flex-1">
            <span>{t("Log in to save your changes")}</span>
            <Button 
              size="sm" 
              onClick={() => setShowAuth(true)}
              className="ml-4"
            >
              {t("Log in")}
            </Button>
          </AlertDescription>
        </div>
      </Alert>
      
      <AuthenticationDialog 
        open={showAuth}
        onOpenChange={setShowAuth}
      />
    </>
  );
};

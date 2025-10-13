import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export const LoginPrompt = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Alert className="mb-4">
      <LogIn className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{t("Log in to save your changes")}</span>
        <Button 
          size="sm" 
          onClick={() => navigate("/auth")}
          className="ml-4"
        >
          {t("Log in")}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

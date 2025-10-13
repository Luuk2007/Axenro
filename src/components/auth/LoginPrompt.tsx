import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoginPromptProps {
  message?: string;
  className?: string;
}

export const LoginPrompt = ({ message, className }: LoginPromptProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Alert className={className}>
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{message || t("Please log in to save your changes")}</span>
        <Button
          size="sm"
          onClick={() => navigate('/auth')}
          className="shrink-0"
        >
          {t("auth.login")}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

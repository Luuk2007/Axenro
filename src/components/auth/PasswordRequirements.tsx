
import React from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, show }) => {
  const { t } = useLanguage();

  if (!show) return null;

  const requirements = [
    {
      text: "At least 8 characters",
      met: password.length >= 8
    },
    {
      text: "One lowercase letter",
      met: /[a-z]/.test(password)
    },
    {
      text: "One uppercase letter", 
      met: /[A-Z]/.test(password)
    },
    {
      text: "One digit",
      met: /\d/.test(password)
    },
    {
      text: "One symbol",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-md border">
      <p className="text-sm font-medium mb-2">Password requirements:</p>
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-red-500" />
            )}
            <span className={req.met ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements;

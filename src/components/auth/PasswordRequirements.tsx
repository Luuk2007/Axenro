
import React from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordRequirementsProps {
  password: string;
  showRequirements: boolean;
}

interface Requirement {
  key: string;
  label: string;
  validator: (password: string) => boolean;
}

export default function PasswordRequirements({ password, showRequirements }: PasswordRequirementsProps) {
  const { t } = useLanguage();

  const requirements: Requirement[] = [
    {
      key: 'length',
      label: 'At least 8 characters',
      validator: (pwd) => pwd.length >= 8
    },
    {
      key: 'lowercase',
      label: 'One lowercase letter',
      validator: (pwd) => /[a-z]/.test(pwd)
    },
    {
      key: 'uppercase',
      label: 'One uppercase letter',
      validator: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      key: 'digit',
      label: 'One number',
      validator: (pwd) => /\d/.test(pwd)
    },
    {
      key: 'symbol',
      label: 'One special character',
      validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  if (!showRequirements) return null;

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-md">
      <p className="text-sm font-medium mb-2 text-muted-foreground">Password requirements:</p>
      <div className="space-y-1">
        {requirements.map((req) => {
          const isValid = req.validator(password);
          return (
            <div key={req.key} className="flex items-center gap-2 text-sm">
              {isValid ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={isValid ? "text-green-600" : "text-muted-foreground"}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

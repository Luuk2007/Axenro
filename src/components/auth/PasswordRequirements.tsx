
import React from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { t } = useLanguage();
  
  const requirements = [
    {
      key: 'minLength',
      label: t('minLength'),
      test: password.length >= 8
    },
    {
      key: 'lowercase', 
      label: t('lowercase'),
      test: /[a-z]/.test(password)
    },
    {
      key: 'uppercase',
      label: t('uppercase'), 
      test: /[A-Z]/.test(password)
    },
    {
      key: 'digits',
      label: t('digits'),
      test: /\d/.test(password)
    },
    {
      key: 'symbols',
      label: t('symbols'),
      test: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{t('passwordRequirements')}</p>
      <div className="space-y-1">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center space-x-2 text-sm">
            {req.test ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className={req.test ? 'text-green-600' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

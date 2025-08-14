
import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePasswordStrength } from '@/utils/securityUtils';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export default function PasswordRequirements({ password, className = '' }: PasswordRequirementsProps) {
  const { isStrong, score, feedback } = validatePasswordStrength(password);
  
  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains number', met: /\d/.test(password) },
    { text: 'Contains special character', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const getStrengthColor = () => {
    if (score <= 2) return 'text-red-500';
    if (score <= 3) return 'text-yellow-500';
    if (score <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStrengthText = () => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span className={`text-sm font-medium ${getStrengthColor()}`}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-red-500" />
            )}
            <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
      
      {!isStrong && feedback.length > 0 && (
        <div className="text-xs text-muted-foreground mt-2">
          <p>Recommendations:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            {feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

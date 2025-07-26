
import { useState, useCallback } from 'react';
import { SecurityUtils } from '@/utils/security';

interface UseSecureInputOptions {
  maxLength?: number;
  required?: boolean;
  type?: 'text' | 'search' | 'number' | 'email';
  min?: number;
  max?: number;
}

export const useSecureInput = (initialValue: string = '', options: UseSecureInputOptions = {}) => {
  const { maxLength = 500, required = false, type = 'text', min, max } = options;
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const updateValue = useCallback((newValue: string) => {
    let sanitizedValue = '';
    let validationError: string | null = null;

    try {
      switch (type) {
        case 'search':
          sanitizedValue = SecurityUtils.sanitizeSearchQuery(newValue);
          break;
        case 'email':
          sanitizedValue = SecurityUtils.sanitizeText(newValue, 254);
          if (sanitizedValue && !SecurityUtils.isValidEmail(sanitizedValue)) {
            validationError = 'Please enter a valid email address';
          }
          break;
        case 'number':
          const numValue = SecurityUtils.sanitizeNumber(newValue, min, max);
          sanitizedValue = numValue.toString();
          break;
        default:
          sanitizedValue = SecurityUtils.sanitizeText(newValue, maxLength);
      }

      if (required && !sanitizedValue.trim()) {
        validationError = 'This field is required';
      }

      // Log suspicious input patterns
      if (newValue.length > 0 && sanitizedValue.length === 0) {
        SecurityUtils.logSecurityEvent('suspicious_input_detected', {
          originalLength: newValue.length,
          type,
          userAgent: navigator.userAgent
        });
      }

    } catch (err) {
      SecurityUtils.logSecurityEvent('input_validation_error', { error: err, type });
      validationError = 'Invalid input detected';
    }

    setValue(sanitizedValue);
    setError(validationError);
  }, [type, maxLength, required, min, max]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    error,
    updateValue,
    reset,
    isValid: error === null && (!required || value.trim().length > 0)
  };
};

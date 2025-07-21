
import { useState, useCallback } from 'react';
import { validateBarcode, rateLimiter, logSecurityEvent } from '@/utils/security';

export const useSecureBarcode = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndProcessBarcode = useCallback((barcode: string) => {
    try {
      // Rate limiting check
      if (!rateLimiter.isAllowed('barcode_scan')) {
        throw new Error('Too many scan attempts. Please wait a moment.');
      }

      // Validate barcode format
      const validatedBarcode = validateBarcode(barcode);
      
      // Log successful validation
      logSecurityEvent('BARCODE_SCANNED', { barcode: validatedBarcode });
      
      setError(null);
      return validatedBarcode;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid barcode';
      setError(errorMessage);
      return null;
    }
  }, []);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setError(null);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setError(null);
  }, []);

  return {
    isScanning,
    error,
    validateAndProcessBarcode,
    startScanning,
    stopScanning,
  };
};

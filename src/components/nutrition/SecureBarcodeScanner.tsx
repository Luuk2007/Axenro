
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
import { useSecureBarcode } from '@/hooks/useSecureBarcode';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface SecureBarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

export const SecureBarcodeScanner: React.FC<SecureBarcodeScannerProps> = ({
  onBarcodeDetected,
  onClose,
}) => {
  const { validateAndProcessBarcode, error: securityError } = useSecureBarcode();
  
  const { scannerRef, startScanner, stopScanner, isScanning } = useBarcodeScanner({
    onDetected: (barcode: string) => {
      const validatedBarcode = validateAndProcessBarcode(barcode);
      if (validatedBarcode) {
        onBarcodeDetected(validatedBarcode);
        onClose();
      }
    },
    onError: (error: string) => {
      console.error('Scanner error:', error);
    }
  });

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/50">
        <h2 className="text-white text-lg font-semibold">Scan Barcode</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 relative">
        <div ref={scannerRef} className="w-full h-full" />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
          </div>
        </div>
      </div>

      {securityError && (
        <div className="p-4 bg-red-500/90 text-white text-center">
          {securityError}
        </div>
      )}
      
      <div className="p-4 bg-black/50 text-center">
        <p className="text-white text-sm">
          Position the barcode within the frame
        </p>
      </div>
    </div>
  );
};

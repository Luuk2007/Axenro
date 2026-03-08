import { useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerConfig {
  onDetected: (barcode: string) => void;
  onError: (error: string) => void;
}

export const useBarcodeScanner = ({ onDetected, onError }: BarcodeScannerConfig) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const processedBarcodes = useRef<Set<string>>(new Set());
  const scannerContainerId = 'barcode-scanner-container';

  const startScanner = useCallback(async () => {
    if (isScanning || isInitializing) return;

    setIsInitializing(true);
    setIsScanning(true);
    setCameraActive(false);
    processedBarcodes.current.clear();

    try {
      // Create scanner element inside ref
      if (scannerRef.current) {
        scannerRef.current.innerHTML = '';
        const scanDiv = document.createElement('div');
        scanDiv.id = scannerContainerId;
        scanDiv.style.width = '100%';
        scanDiv.style.height = '100%';
        scannerRef.current.appendChild(scanDiv);
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      // Get available cameras, prefer back camera
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error('No camera found on this device.');
      }

      setCameraPermission('granted');

      // Find back camera
      const backCamera = cameras.find(c => 
        c.label.toLowerCase().includes('back') || 
        c.label.toLowerCase().includes('rear') ||
        c.label.toLowerCase().includes('environment')
      );
      const cameraId = backCamera?.id || cameras[cameras.length - 1].id;

      await html5QrCode.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.5,
          disableFlip: false,
        },
        (decodedText) => {
          // Barcode successfully scanned
          if (!processedBarcodes.current.has(decodedText)) {
            processedBarcodes.current.add(decodedText);
            console.log('Barcode detected:', decodedText);
            onDetected(decodedText);

            // Allow rescanning same barcode after delay
            setTimeout(() => {
              processedBarcodes.current.delete(decodedText);
            }, 3000);
          }
        },
        () => {
          // Scan failure (no barcode found in frame) - this is expected, ignore
        }
      );

      setCameraActive(true);
      setIsInitializing(false);

      // Style the video for better appearance
      if (scannerRef.current) {
        const video = scannerRef.current.querySelector('video');
        if (video) {
          video.style.objectFit = 'cover';
          video.style.borderRadius = '0';
        }
        // Hide the default qr-shaded-region border
        const shadedRegion = scannerRef.current.querySelector('#qr-shaded-region');
        if (shadedRegion) {
          (shadedRegion as HTMLElement).style.borderColor = 'rgba(34, 197, 94, 0.5)';
        }
      }
    } catch (err: any) {
      console.error('Scanner start error:', err);
      
      if (err.name === 'NotAllowedError' || err.message?.includes('denied')) {
        setCameraPermission('denied');
        onError('Camera access denied. Please allow camera access and try again.');
      } else {
        onError(err.message || 'Failed to start camera scanner');
      }
      
      setIsScanning(false);
      setCameraActive(false);
      setIsInitializing(false);
    }
  }, [onDetected, onError, isScanning, isInitializing]);

  const stopScanner = useCallback(async () => {
    console.log('Stopping scanner...');
    
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (error) {
        console.warn('Error stopping scanner:', error);
      }
      html5QrCodeRef.current = null;
    }

    if (scannerRef.current) {
      scannerRef.current.innerHTML = '';
    }

    setIsScanning(false);
    setCameraActive(false);
    setIsInitializing(false);
    processedBarcodes.current.clear();
  }, []);

  return {
    scannerRef,
    isScanning,
    cameraActive,
    cameraPermission,
    isInitializing,
    startScanner,
    stopScanner
  };
};


import { useRef, useState, useEffect, useCallback } from 'react';
import Quagga from 'quagga';

interface BarcodeScannerConfig {
  onDetected: (barcode: string) => void;
  onError: (error: string) => void;
}

export const useBarcodeScanner = ({ onDetected, onError }: BarcodeScannerConfig) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const scannerRef = useRef<HTMLDivElement>(null);
  const processedBarcodes = useRef<Set<string>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.warn('Permission API not supported');
    }
  };

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || isScanning) {
      console.log('Scanner ref not available or already scanning');
      return;
    }

    try {
      console.log('Requesting camera access...');
      setIsScanning(true);
      processedBarcodes.current.clear();

      // First, request camera access directly
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      console.log('Camera access granted, stream:', stream);
      streamRef.current = stream;
      setCameraPermission('granted');

      // Initialize Quagga with the stream
      await new Promise<void>((resolve, reject) => {
        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment"
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: true
          },
          numOfWorkers: 2,
          frequency: 10,
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
              "codabar_reader",
              "i2of5_reader"
            ]
          },
          locate: true
        }, (err) => {
          if (err) {
            console.error('Quagga initialization error:', err);
            onError('Failed to initialize barcode scanner: ' + err.message);
            reject(err);
            return;
          }
          
          console.log('Quagga initialized successfully');
          resolve();
        });
      });

      // Start Quagga
      Quagga.start();
      setCameraActive(true);
      console.log('Quagga started, camera should be active');

      // Set up barcode detection handler
      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        console.log('Barcode detected:', code);
        
        // Prevent duplicate detections
        if (!processedBarcodes.current.has(code)) {
          processedBarcodes.current.add(code);
          onDetected(code);
        }
      });

    } catch (err: any) {
      console.error('Scanner start error:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access and try again.';
        setCameraPermission('denied');
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += 'Please check your camera settings.';
      }
      
      onError(errorMessage);
      setIsScanning(false);
      setCameraActive(false);
    }
  }, [onDetected, onError, isScanning]);

  const stopScanner = useCallback(() => {
    if (isScanning) {
      console.log('Stopping Quagga scanner...');
      
      try {
        Quagga.stop();
        Quagga.offDetected();
        Quagga.offProcessed();
      } catch (error) {
        console.warn('Error stopping Quagga:', error);
      }

      // Stop the media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }

      setIsScanning(false);
      setCameraActive(false);
      processedBarcodes.current.clear();
    }
  }, [isScanning]);

  useEffect(() => {
    checkCameraPermission();
    
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return {
    scannerRef,
    isScanning,
    cameraActive,
    cameraPermission,
    startScanner,
    stopScanner
  };
};

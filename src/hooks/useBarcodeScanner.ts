
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
      console.log('Starting camera...');
      setIsScanning(true);
      setCameraActive(false);
      processedBarcodes.current.clear();

      // Stop any existing Quagga instance
      try {
        Quagga.stop();
      } catch (e) {
        // Ignore if Quagga wasn't running
      }

      // Initialize Quagga with direct camera access
      await new Promise<void>((resolve, reject) => {
        const config = {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: { min: 320, ideal: 640, max: 1920 },
              height: { min: 240, ideal: 480, max: 1080 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 }
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: true
          },
          numOfWorkers: navigator.hardwareConcurrency || 2,
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
        };

        console.log('Initializing Quagga with config:', config);
        
        Quagga.init(config, (err) => {
          if (err) {
            console.error('Quagga initialization failed:', err);
            onError('Failed to initialize camera: ' + err.message);
            setIsScanning(false);
            reject(err);
            return;
          }
          
          console.log('Quagga initialized successfully');
          
          // Start Quagga scanner
          Quagga.start();
          console.log('Quagga started');
          
          setCameraActive(true);
          setCameraPermission('granted');
          resolve();
        });
      });

      // Set up barcode detection
      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        console.log('Barcode detected:', code);
        
        if (!processedBarcodes.current.has(code)) {
          processedBarcodes.current.add(code);
          onDetected(code);
          
          // Clear the processed barcode after a delay to allow rescanning
          setTimeout(() => {
            processedBarcodes.current.delete(code);
          }, 3000);
        }
      });

    } catch (err: any) {
      console.error('Scanner start error:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access and try again.';
        setCameraPermission('denied');
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += 'Please check your camera settings and try again.';
      }
      
      onError(errorMessage);
      setIsScanning(false);
      setCameraActive(false);
    }
  }, [onDetected, onError, isScanning]);

  const stopScanner = useCallback(() => {
    console.log('Stopping scanner...');
    
    try {
      Quagga.stop();
      Quagga.offDetected();
      Quagga.offProcessed();
    } catch (error) {
      console.warn('Error stopping Quagga:', error);
    }

    // Clean up any media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    setIsScanning(false);
    setCameraActive(false);
    processedBarcodes.current.clear();
  }, []);

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

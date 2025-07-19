
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
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const processedBarcodes = useRef<Set<string>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const quaggaInitialized = useRef(false);

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

  const requestCameraAccess = async (): Promise<MediaStream> => {
    console.log('Requesting camera access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { min: 320, ideal: 640, max: 1920 },
          height: { min: 240, ideal: 480, max: 1080 }
        }
      });
      
      console.log('Camera access granted:', stream);
      setCameraPermission('granted');
      streamRef.current = stream;
      return stream;
    } catch (err: any) {
      console.error('Camera access denied:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        throw new Error('Camera access denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        throw new Error('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        throw new Error('Camera is being used by another application.');
      } else {
        throw new Error('Could not access camera. Please check your camera settings.');
      }
    }
  };

  const startScanner = useCallback(async () => {
    if (isScanning || isInitializing) {
      console.log('Scanner already running or initializing');
      return;
    }

    if (!scannerRef.current) {
      console.error('Scanner ref not available');
      onError('Camera container not ready. Please try again.');
      return;
    }

    console.log('Starting camera scanner...');
    setIsInitializing(true);
    setIsScanning(true);
    setCameraActive(false);
    processedBarcodes.current.clear();

    try {
      // Stop any existing Quagga instance
      if (quaggaInitialized.current) {
        try {
          Quagga.stop();
          Quagga.offDetected();
          Quagga.offProcessed();
        } catch (e) {
          console.warn('Error stopping existing Quagga:', e);
        }
        quaggaInitialized.current = false;
      }

      // Request camera access first
      const stream = await requestCameraAccess();
      console.log('Camera stream obtained, initializing Quagga...');

      // Initialize Quagga with the camera stream
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
            reject(new Error('Failed to initialize barcode scanner: ' + err.message));
            return;
          }
          
          console.log('Quagga initialized successfully');
          quaggaInitialized.current = true;
          
          // Start Quagga scanner
          Quagga.start();
          console.log('Quagga started');
          
          // Set camera active after a short delay to ensure video element is created
          setTimeout(() => {
            setCameraActive(true);
            console.log('Camera marked as active');
          }, 500);
          
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
      onError(err.message || 'Failed to start camera scanner');
      setIsScanning(false);
      setCameraActive(false);
    } finally {
      setIsInitializing(false);
    }
  }, [onDetected, onError, isScanning, isInitializing]);

  const stopScanner = useCallback(() => {
    console.log('Stopping scanner...');
    
    if (quaggaInitialized.current) {
      try {
        Quagga.stop();
        Quagga.offDetected();
        Quagga.offProcessed();
      } catch (error) {
        console.warn('Error stopping Quagga:', error);
      }
      quaggaInitialized.current = false;
    }

    // Clean up media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    setIsScanning(false);
    setCameraActive(false);
    setIsInitializing(false);
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
    isInitializing,
    startScanner,
    stopScanner
  };
};

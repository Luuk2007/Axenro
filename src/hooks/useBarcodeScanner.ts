
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
      // Optimized camera constraints for better performance and quality
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          // Enable autofocus for sharper images
          focusMode: { ideal: 'continuous' },
          // Better exposure for barcode scanning
          exposureMode: { ideal: 'continuous' },
          whiteBalanceMode: { ideal: 'continuous' }
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

      // Create video element immediately and attach stream
      if (scannerRef.current && stream) {
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        videoElement.style.position = 'absolute';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.zIndex = '1';
        
        // Clear any existing content and add video
        scannerRef.current.innerHTML = '';
        scannerRef.current.appendChild(videoElement);
        
        // Set camera active immediately when video can start playing
        videoElement.oncanplay = () => {
          setCameraActive(true);
          setIsInitializing(false);
          console.log('Video stream ready, camera active');
        };
      }

      // Initialize Quagga with optimized settings for faster scanning
      await new Promise<void>((resolve, reject) => {
        const config = {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 }
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: false, // Keep full resolution for better accuracy
            debug: {
              showCanvas: false,
              showPatches: false,
              showFoundPatches: false,
              showSkeleton: false,
              showLabels: false,
              showPatchLabels: false,
              showRemainingPatchLabels: false,
              boxFromPatches: {
                showTransformed: false,
                showTransformedBox: false,
                showBB: false
              }
            }
          },
          // Increase worker count for better performance
          numOfWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
          // Increase frequency for faster scanning
          frequency: 20,
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader", 
              "code_128_reader",
              "code_39_reader",
              "codabar_reader",
              "i2of5_reader"
            ],
            // Optimize decoder settings for speed
            multiple: false,
            debug: {
              drawBoundingBox: false,
              showFrequency: false,
              drawScanline: false,
              drawPatches: false
            }
          },
          locate: true
        };

        console.log('Initializing Quagga with optimized config:', config);
        
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
          
          resolve();
        });
      });

      // Set up barcode detection with confidence filtering
      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        const confidence = data.codeResult.decodedCodes.reduce((acc, code) => acc + code.error || 0, 0) / data.codeResult.decodedCodes.length;
        
        console.log('Barcode detected:', code, 'Confidence:', confidence);
        
        // Only process barcodes with good confidence (lower error rate is better)
        if (confidence < 0.25 && !processedBarcodes.current.has(code)) {
          processedBarcodes.current.add(code);
          onDetected(code);
          
          // Clear the processed barcode after a shorter delay for faster rescanning
          setTimeout(() => {
            processedBarcodes.current.delete(code);
          }, 1000);
        }
      });

    } catch (err: any) {
      console.error('Scanner start error:', err);
      onError(err.message || 'Failed to start camera scanner');
      setIsScanning(false);
      setCameraActive(false);
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

    // Clear the scanner container
    if (scannerRef.current) {
      scannerRef.current.innerHTML = '';
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

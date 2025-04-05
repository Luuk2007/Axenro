import React, { useRef, useState } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ArrowLeft, Camera, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Meal {
  id: string;
  name: string;
}

interface ScannedProduct {
  code: string;
  name: string;
  description: string;
  servingSize: string;
  servings: number;
  calories: number;
  macros: {
    carbs: { value: number, unit: string, percentage: number };
    fat: { value: number, unit: string, percentage: number };
    protein: { value: number, unit: string, percentage: number };
  };
}

interface BarcodeScannerDialogProps {
  meals: Meal[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddProduct: () => void;
}

const BarcodeScannerDialog = ({ meals, selectedMeal, onClose, onAddProduct }: BarcodeScannerDialogProps) => {
  const { t } = useLanguage();
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [scanStep, setScanStep] = useState<'scanning' | 'result'>('scanning');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCloseScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      // Stop all video streams when closing the dialog
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    onClose();
  };

  // In a real app, we'd implement the actual barcode scanning logic here
  // For demo purposes, we'll simulate scanning after a timeout
  React.useEffect(() => {
    if (cameraActive) {
      const initCamera = async () => {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request camera permissions
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              } 
            });
            
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              await videoRef.current.play().catch(e => console.error("Error playing video:", e));
              
              // Simulate scanning a barcode after 2 seconds
              setTimeout(() => {
                // Simulate finding a product
                const randomProducts = [
                  {
                    code: '8718998269173',
                    name: 'Optimel Yoghurt Naturel',
                    description: 'Low fat natural yogurt',
                    servingSize: '100 gram',
                    servings: 1,
                    calories: 58,
                    macros: {
                      carbs: { value: 4.1, unit: 'g', percentage: 28 },
                      fat: { value: 3.0, unit: 'g', percentage: 23 },
                      protein: { value: 4.6, unit: 'g', percentage: 32 }
                    }
                  },
                  {
                    code: '5449000214911',
                    name: 'Coca-Cola',
                    description: 'Carbonated soft drink',
                    servingSize: '100 ml',
                    servings: 1,
                    calories: 42,
                    macros: {
                      carbs: { value: 10.6, unit: 'g', percentage: 97 },
                      fat: { value: 0, unit: 'g', percentage: 0 },
                      protein: { value: 0, unit: 'g', percentage: 0 }
                    }
                  },
                  {
                    code: '8710624000299',
                    name: 'Biologische Volle Kwark',
                    description: 'Organic full-fat quark',
                    servingSize: '100 gram',
                    servings: 1,
                    calories: 100,
                    macros: {
                      carbs: { value: 3.5, unit: 'g', percentage: 14 },
                      fat: { value: 6.5, unit: 'g', percentage: 58 },
                      protein: { value: 7, unit: 'g', percentage: 28 }
                    }
                  }
                ];
                
                const product = randomProducts[Math.floor(Math.random() * randomProducts.length)];
                
                if (canvasRef.current && videoRef.current) {
                  // Take a snapshot from the video
                  const context = canvasRef.current.getContext('2d');
                  if (context && videoRef.current.videoWidth > 0) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                  }
                }
                
                // Change to result view
                setScannedProduct(product);
                setScanStep('result');
              }, 2000);
            }
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
        }
      };

      initCamera();
    }
  }, [cameraActive]);

  React.useEffect(() => {
    setCameraActive(true);
  }, []);

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden">
      {scanStep === 'scanning' ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button className="p-2" onClick={handleCloseScan}>
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-medium text-lg">{t("scanBarcode")}</h3>
            <div className="w-9"></div>
          </div>
          
          <div className="relative flex-1 aspect-[9/16] bg-black">
            {cameraActive ? (
              <>
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                ></video>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2/3 h-32 relative">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400"></div>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400"></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Camera className="h-8 w-8 text-white mb-4 animate-pulse" />
                <p className="text-sm text-white">Initializing camera...</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center px-4 py-3 border-b border-border">
            <button className="p-2 mr-2" onClick={() => setScanStep('scanning')}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="font-medium text-lg">{t("addFood")}</h3>
          </div>
          
          {scannedProduct && (
            <div className="p-4 space-y-6">
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <div className="flex items-center">
                  <p className="text-gray-600 text-sm flex-1">
                    Barcode matches: "{scannedProduct.code}"
                  </p>
                  <a href="#" className="text-blue-500 text-sm whitespace-nowrap">
                    Find a better match
                  </a>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold">{scannedProduct.name}</h2>
                <p className="text-gray-600">{scannedProduct.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Serving Size</p>
                  <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                    <span>{scannedProduct.servingSize}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="font-medium">Number of Servings</p>
                  <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                    <span>{scannedProduct.servings}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="font-medium">Meal</p>
                  <Select defaultValue={selectedMeal || "1"}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select meal" />
                    </SelectTrigger>
                    <SelectContent>
                      {meals.map(meal => (
                        <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-stretch space-x-4">
                <div className="bg-white rounded-full w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center shadow-sm border border-gray-200">
                  <span className="text-2xl font-bold">{scannedProduct.calories}</span>
                  <span className="text-xs text-gray-500">cal</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-around">
                  <div className="flex justify-between">
                    <span className="text-green-500">{scannedProduct.macros.carbs.percentage}%</span>
                    <span className="text-blue-500">{scannedProduct.macros.fat.percentage}%</span>
                    <span className="text-purple-500">{scannedProduct.macros.protein.percentage}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="text-xl font-semibold">{scannedProduct.macros.carbs.value}{scannedProduct.macros.carbs.unit}</div>
                      <div className="text-xs text-gray-500">{t("carbs")}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-semibold">{scannedProduct.macros.fat.value}{scannedProduct.macros.fat.unit}</div>
                      <div className="text-xs text-gray-500">{t("fat")}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-semibold">{scannedProduct.macros.protein.value}{scannedProduct.macros.protein.unit}</div>
                      <div className="text-xs text-gray-500">{t("protein")}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-center">
                <Button className="w-full" onClick={onAddProduct}>
                  <Check className="mr-2 h-4 w-4" />
                  Add to Meal Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </DialogContent>
  );
};

export default BarcodeScannerDialog;

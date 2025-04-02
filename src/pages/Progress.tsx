
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Camera, Plus, Upload, Weight, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';
// Rename the Progress component import to ProgressBar to avoid conflict
import { Progress as ProgressBar } from '@/components/ui/progress';
import { WeightTracker } from '@/components/progress/WeightTracker';

// Sample images for progress photos
const progressPhotos = [
  { id: '1', date: 'Jun 1, 2023', url: '/placeholder.svg' },
  { id: '2', date: 'Jul 1, 2023', url: '/placeholder.svg' },
  { id: '3', date: 'Aug 1, 2023', url: '/placeholder.svg' },
  { id: '4', date: 'Sep 1, 2023', url: '/placeholder.svg' },
];

// Measurement types
const measurementTypes = [
  { id: 'weight', name: 'Weight', unit: 'kg' },
  { id: 'chest', name: 'Chest', unit: 'cm' },
  { id: 'waist', name: 'Waist', unit: 'cm' },
  { id: 'hips', name: 'Hips', unit: 'cm' },
  { id: 'biceps', name: 'Biceps', unit: 'cm' },
  { id: 'thighs', name: 'Thighs', unit: 'cm' },
  { id: 'calves', name: 'Calves', unit: 'cm' },
  { id: 'bodyfat', name: 'Body Fat', unit: '%' },
];

export default function Progress() {
  const { t } = useLanguage();
  const [measurementType, setMeasurementType] = useState('weight');
  const [measurementValue, setMeasurementValue] = useState('');
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleAddMeasurement = () => {
    if (!measurementValue) {
      toast.error('Please enter a value');
      return;
    }
    
    const value = parseFloat(measurementValue);
    
    if (isNaN(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    
    const selectedType = measurementTypes.find(type => type.id === measurementType);
    
    if (measurementType === 'weight') {
      // The weight is now handled by the WeightTracker component
      toast.success(`${selectedType?.name} measurement added`);
    } else {
      toast.success(`${selectedType?.name} measurement added`);
    }
    
    setMeasurementValue('');
  };
  
  const handleCapturePhoto = async () => {
    setShowCamera(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } else {
        toast.error('Camera not available on this device');
        setShowCamera(false);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please check permissions.');
      setShowCamera(false);
    }
  };
  
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageData = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageData);
        
        // Stop the video stream
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        
        setShowCamera(false);
      }
    }
  };
  
  const savePhoto = () => {
    if (capturedImage) {
      const today = format(new Date(), 'MMM d, yyyy');
      // In a real app, you would upload the image to a server here
      toast.success('Progress photo saved');
      setCapturedImage(null);
      setShowAddPhoto(false);
    }
  };

  const handleSelectFromGallery = () => {
    // Simulate selecting from gallery
    // In a real app, this would open the device's file picker
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const result = loadEvent.target?.result as string;
          setCapturedImage(result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("progress")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("addMeasurement")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addMeasurement")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("type")}</label>
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={measurementType}
                    onChange={(e) => setMeasurementType(e.target.value)}
                  >
                    {measurementTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("value")} ({measurementTypes.find(type => type.id === measurementType)?.unit})
                  </label>
                  <Input 
                    type="number" 
                    value={measurementValue}
                    onChange={(e) => setMeasurementValue(e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("date")}</label>
                  <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <Button onClick={handleAddMeasurement} className="w-full">
                  {t("add")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="weight">{t("weight")}</TabsTrigger>
          <TabsTrigger value="measurements">{t("measurements")}</TabsTrigger>
          <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weight" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <WeightTracker />
          </div>
        </TabsContent>
        
        <TabsContent value="measurements" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glassy-card rounded-xl overflow-hidden card-shadow">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-medium tracking-tight">Body Measurements</h3>
              </div>
              <div className="p-5 space-y-4">
                {measurementTypes.filter(type => type.id !== 'weight').map(type => (
                  <div key={type.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="text-sm">
                      {type.id === 'chest' ? '95 cm' :
                       type.id === 'waist' ? '80 cm' :
                       type.id === 'hips' ? '90 cm' :
                       type.id === 'biceps' ? '35 cm' :
                       type.id === 'thighs' ? '55 cm' :
                       type.id === 'calves' ? '38 cm' :
                       type.id === 'bodyfat' ? '18%' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glassy-card rounded-xl overflow-hidden card-shadow">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-medium tracking-tight">Measurement History</h3>
              </div>
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Measurement</th>
                      <th className="pb-2 font-medium text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3">Jun 1, 2023</td>
                      <td className="py-3">Weight</td>
                      <td className="py-3 text-right">78.5 kg</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">Jun 1, 2023</td>
                      <td className="py-3">Waist</td>
                      <td className="py-3 text-right">85 cm</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">Jul 1, 2023</td>
                      <td className="py-3">Weight</td>
                      <td className="py-3 text-right">77.2 kg</td>
                    </tr>
                    <tr>
                      <td className="py-3">Jul 1, 2023</td>
                      <td className="py-3">Waist</td>
                      <td className="py-3 text-right">82 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="photos" className="space-y-6">
          <Dialog open={showAddPhoto} onOpenChange={setShowAddPhoto}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Progress Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {capturedImage ? (
                  <div className="space-y-4">
                    <div className="aspect-square max-h-96 overflow-hidden rounded-lg">
                      <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCapturedImage(null)}>
                        Retake
                      </Button>
                      <Button onClick={savePhoto}>
                        Save Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={handleCapturePhoto} className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Take a Photo
                    </Button>
                    <Button onClick={handleSelectFromGallery} className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload from Gallery
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCamera} onOpenChange={(open) => {
            if (!open && videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
              videoRef.current.srcObject = null;
            }
            setShowCamera(open);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Take a Photo</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="relative aspect-square max-h-96 overflow-hidden rounded-lg bg-black">
                  <video 
                    ref={videoRef} 
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <Button onClick={takePicture} size="lg" className="rounded-full h-12 w-12 p-0">
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Progress Photos</h3>
            <Button variant="outline" onClick={() => setShowAddPhoto(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Photo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progressPhotos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
                <img 
                  src={photo.url} 
                  alt={`Progress from ${photo.date}`} 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Calendar className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm">{photo.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

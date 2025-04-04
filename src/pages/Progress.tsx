
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Camera, Plus, Upload, Weight, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { WeightTracker } from '@/components/progress/WeightTracker';

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

interface MeasurementEntry {
  id: string;
  type: string;
  value: number;
  date: string;
  unit: string;
}

interface ProgressPhoto {
  id: string;
  date: string;
  url: string;
}

export default function Progress() {
  const { t } = useLanguage();
  const [measurementType, setMeasurementType] = useState('waist');
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementDate, setMeasurementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load measurements and photos from localStorage on initial render
  useEffect(() => {
    const savedMeasurements = localStorage.getItem('bodyMeasurements');
    const savedPhotos = localStorage.getItem('progressPhotos');
    
    if (savedMeasurements) {
      try {
        setMeasurements(JSON.parse(savedMeasurements));
      } catch (error) {
        console.error("Error loading measurements:", error);
      }
    }
    
    if (savedPhotos) {
      try {
        setProgressPhotos(JSON.parse(savedPhotos));
      } catch (error) {
        console.error("Error loading progress photos:", error);
      }
    } else {
      // If no photos exist, set some examples
      const demoPhotos = [
        { id: '1', date: 'Jun 1, 2023', url: '/placeholder.svg' },
        { id: '2', date: 'Jul 1, 2023', url: '/placeholder.svg' },
      ];
      setProgressPhotos(demoPhotos);
      localStorage.setItem('progressPhotos', JSON.stringify(demoPhotos));
    }
  }, []);
  
  // Save measurements to localStorage whenever they change
  useEffect(() => {
    if (measurements.length > 0) {
      localStorage.setItem('bodyMeasurements', JSON.stringify(measurements));
    }
  }, [measurements]);
  
  // Save progress photos to localStorage whenever they change
  useEffect(() => {
    if (progressPhotos.length > 0) {
      localStorage.setItem('progressPhotos', JSON.stringify(progressPhotos));
    }
  }, [progressPhotos]);
  
  const handleAddMeasurement = () => {
    if (!measurementValue) {
      toast.error(t('pleaseEnterValue'));
      return;
    }
    
    const value = parseFloat(measurementValue);
    
    if (isNaN(value)) {
      toast.error(t('pleaseEnterValidNumber'));
      return;
    }
    
    const selectedType = measurementTypes.find(type => type.id === measurementType);
    
    if (!selectedType) {
      toast.error(t('invalidMeasurementType'));
      return;
    }
    
    // Create new measurement entry
    const newMeasurement = {
      id: `${measurementType}-${Date.now()}`,
      type: measurementType,
      value,
      date: measurementDate,
      unit: selectedType.unit
    };
    
    // Add to measurements array
    setMeasurements(prev => [...prev, newMeasurement]);
    
    toast.success(`${selectedType.name} ${t('measurementAdded')}`);
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
        toast.error(t('cameraNotAvailable'));
        setShowCamera(false);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error(t('couldNotAccessCamera'));
      setShowCamera(false);
    }
  };
  
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context && videoRef.current.videoWidth > 0) {
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
      // Add the new photo to our state
      const newPhoto = {
        id: `photo-${Date.now()}`,
        date: today,
        url: capturedImage
      };
      
      setProgressPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      toast.success(t('progressPhotoSaved'));
      setCapturedImage(null);
      setShowAddPhoto(false);
    }
  };

  const handleSelectFromGallery = () => {
    // Simulate selecting from gallery using file input
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
          // Save directly when file is selected
          const today = format(new Date(), 'MMM d, yyyy');
          const newPhoto = {
            id: `photo-${Date.now()}`,
            date: today,
            url: result
          };
          
          setProgressPhotos(prevPhotos => [...prevPhotos, newPhoto]);
          toast.success(t('progressPhotoSaved'));
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };
  
  const getMeasurementsByType = (type: string) => {
    return measurements.filter(m => m.type === type);
  };
  
  const getLatestMeasurement = (type: string) => {
    const typeMeasurements = getMeasurementsByType(type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return typeMeasurements.length > 0 ? typeMeasurements[0] : null;
  };
  
  const prepareMeasurementDataForChart = (type: string) => {
    return getMeasurementsByType(type).map(m => ({
      date: format(parseISO(m.date), 'MMM d'),
      value: m.value,
      originalDate: m.date
    })).sort((a, b) => {
      // Sort by original date
      const dateA = new Date(a.originalDate || a.date);
      const dateB = new Date(b.originalDate || b.date);
      return dateA.getTime() - dateB.getTime();
    });
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
                <DialogDescription>{t("trackYourBodyMeasurements")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("type")}</label>
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={measurementType}
                    onChange={(e) => setMeasurementType(e.target.value)}
                  >
                    {measurementTypes.filter(type => type.id !== 'weight').map(type => (
                      <option key={type.id} value={type.id}>{t(type.name.toLowerCase())}</option>
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
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("date")}</label>
                  <Input 
                    type="date" 
                    value={measurementDate}
                    onChange={(e) => setMeasurementDate(e.target.value)} 
                  />
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
                <h3 className="font-medium tracking-tight">{t("bodyMeasurements")}</h3>
              </div>
              <div className="p-5 space-y-4">
                {measurementTypes.filter(type => type.id !== 'weight').map(type => {
                  const latestMeasurement = getLatestMeasurement(type.id);
                  
                  return (
                    <div key={type.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t(type.name.toLowerCase())}</span>
                      <span className="text-sm">
                        {latestMeasurement ? `${latestMeasurement.value} ${type.unit}` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="glassy-card rounded-xl overflow-hidden card-shadow">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-medium tracking-tight">{t("measurementHistory")}</h3>
              </div>
              <div className="p-5">
                {measurements.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-border">
                          <th className="pb-2 font-medium">{t("date")}</th>
                          <th className="pb-2 font-medium">{t("measurement")}</th>
                          <th className="pb-2 font-medium text-right">{t("value")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...measurements]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(measurement => (
                            <tr key={measurement.id} className="border-b border-border">
                              <td className="py-3">{format(parseISO(measurement.date), 'MMM d, yyyy')}</td>
                              <td className="py-3">{t(measurementTypes.find(type => type.id === measurement.type)?.name.toLowerCase() || '')}</td>
                              <td className="py-3 text-right">{measurement.value} {measurement.unit}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      {t("noMeasurementsYet")}
                    </p>
                    <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="true"]')?.click()}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t("addFirstMeasurement")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Show measurement chart if we have data */}
            {measurements.length > 0 && (
              <div className="col-span-2">
                <Tabs defaultValue="waist" className="w-full">
                  <TabsList className="mb-4 flex flex-wrap">
                    {measurementTypes.filter(type => type.id !== 'weight').map(type => (
                      <TabsTrigger key={type.id} value={type.id} disabled={getMeasurementsByType(type.id).length === 0}>
                        {t(type.name.toLowerCase())}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {measurementTypes.filter(type => type.id !== 'weight').map(type => (
                    <TabsContent key={type.id} value={type.id}>
                      {getMeasurementsByType(type.id).length > 0 ? (
                        <ProgressChart
                          data={prepareMeasurementDataForChart(type.id)}
                          title={t(type.name.toLowerCase())}
                          label={type.unit}
                          color="#4F46E5"
                        />
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          {t("noDataForThisMeasurement")}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="photos" className="space-y-6">
          <Dialog open={showAddPhoto} onOpenChange={setShowAddPhoto}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addProgressPhoto")}</DialogTitle>
                <DialogDescription>{t("trackYourProgressVisually")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {capturedImage ? (
                  <div className="space-y-4">
                    <div className="aspect-square max-h-96 overflow-hidden rounded-lg">
                      <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCapturedImage(null)}>
                        {t("retake")}
                      </Button>
                      <Button onClick={savePhoto}>
                        {t("savePhoto")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={handleCapturePhoto} className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      {t("takePhoto")}
                    </Button>
                    <Button onClick={handleSelectFromGallery} className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      {t("uploadFromGallery")}
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
                <DialogTitle>{t("takePhoto")}</DialogTitle>
                <DialogDescription>{t("positionYourselfAndClickButton")}</DialogDescription>
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
            <h3 className="text-lg font-medium">{t("progressPhotos")}</h3>
            <Button variant="outline" onClick={() => setShowAddPhoto(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addPhoto")}
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
                
                {/* Button to remove photo */}
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setProgressPhotos(photos => photos.filter(p => p.id !== photo.id));
                    toast.success(t("photoRemoved"));
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {progressPhotos.length === 0 && (
              <div className="col-span-2 md:col-span-4 flex flex-col items-center justify-center py-12 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">{t("noProgressPhotos")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("startTrackingVisualProgress")}
                </p>
                <Button onClick={() => setShowAddPhoto(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addFirstPhoto")}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Camera, Plus, Upload, Weight, ArrowUp, ArrowDown, X, Trash2, Filter, Grid, Clock, ArrowLeftRight, Star, Heart, Ruler, TrendingUp, Activity, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPrompt } from '@/components/auth/LoginPrompt';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Progress as ProgressBar } from '@/components/ui/progress';
import WeightTracker from '@/components/progress/WeightTracker';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile';

import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { useSubscription } from '@/hooks/useSubscription';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import AddProgressPhotoDialog from '@/components/progress/AddProgressPhotoDialog';
import EditProgressPhotoDialog from '@/components/progress/EditProgressPhotoDialog';
import ProgressPhotoCard from '@/components/progress/ProgressPhotoCard';
import ProgressTimeline from '@/components/progress/ProgressTimeline';
import PhotoComparisonDialog from '@/components/progress/PhotoComparisonDialog';
import { ProgressPhoto, PHOTO_CATEGORIES } from '@/types/progressPhotos';

interface MeasurementType {
  id: string;
  name: string;
  unit: string;
  enabled: boolean;
  isCustom?: boolean;
}

export default function Progress() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { subscription_tier, test_mode, test_subscription_tier, loading: subscriptionLoading, initialized } = useSubscription();
  
  // Determine current plan
  const currentPlan = test_mode ? test_subscription_tier : subscription_tier;
  const isFree = currentPlan === 'free';
  const isPro = currentPlan === 'pro';
  const isPremium = currentPlan === 'premium';
  
  // Show photos tab logic: Only show when we're certain user has access (pro/premium)
  // Gate rendering until subscription is initialized to avoid flicker
  const showPhotosTab = initialized && (currentPlan === 'pro' || currentPlan === 'premium');

  const [measurementType, setMeasurementType] = useState('waist');
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementDate, setMeasurementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);

  const { measurements, loading: measurementsLoading, addMeasurement, deleteMeasurement } = useBodyMeasurements();
  const { photos, loading: photosLoading, addPhoto, updatePhoto, deletePhoto } = useProgressPhotos();

  const [showAddPhotoDialog, setShowAddPhotoDialog] = useState(false);
  const [showEditPhotoDialog, setShowEditPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [photoViewMode, setPhotoViewMode] = useState<'grid' | 'timeline'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMilestonesOnly, setShowMilestonesOnly] = useState(false);
  const [comparisonPhotos, setComparisonPhotos] = useState<ProgressPhoto[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const defaultMeasurementTypes: MeasurementType[] = [
    { id: 'chest', name: 'Chest', unit: 'cm', enabled: true },
    { id: 'waist', name: 'Waist', unit: 'cm', enabled: true },
    { id: 'hips', name: 'Hips', unit: 'cm', enabled: true },
    { id: 'biceps', name: 'Biceps', unit: 'cm', enabled: true },
    { id: 'thighs', name: 'Thighs', unit: 'cm', enabled: true },
    { id: 'calves', name: 'Calves', unit: 'cm', enabled: false },
    { id: 'bodyfat', name: 'Body Fat', unit: '%', enabled: false },
  ];

  const loadMeasurementTypes = () => {
    const savedTypes = localStorage.getItem('measurementTypes');
    if (savedTypes) {
      try {
        const types = JSON.parse(savedTypes);
        setMeasurementTypes(types);
        const firstEnabled = types.find((type: MeasurementType) => type.enabled);
        if (firstEnabled) {
          setMeasurementType(firstEnabled.id);
        }
      } catch (error) {
        console.error('Error loading measurement types:', error);
        setMeasurementTypes(defaultMeasurementTypes);
      }
    } else {
      setMeasurementTypes(defaultMeasurementTypes);
    }
  };
  
  useEffect(() => {
    loadMeasurementTypes();
  }, []);

  useEffect(() => {
    const handleMeasurementTypesChange = () => {
      loadMeasurementTypes();
    };

    window.addEventListener('measurementTypesChanged', handleMeasurementTypesChange);
    return () => {
      window.removeEventListener('measurementTypesChanged', handleMeasurementTypesChange);
    };
  }, []);

  const getDisplayName = (measurement: MeasurementType) => {
    // For custom measurements, always show the custom name
    if (measurement.isCustom) {
      return measurement.name;
    }
    // For default measurements, use translation if available, otherwise use the name
    return t(measurement.id) || measurement.name;
  };

  const handleAddMeasurement = async () => {
    if (!measurementValue) {
      toast.error(t('Please enter value'));
      return;
    }
    
    const value = parseFloat(measurementValue);
    
    if (isNaN(value)) {
      toast.error(t('Please enter valid number'));
      return;
    }
    
    const selectedType = measurementTypes.find(type => type.id === measurementType);
    
    if (!selectedType) {
      toast.error(t('invalidMeasurementType'));
      return;
    }
    
    const newMeasurement = {
      type: measurementType,
      value,
      date: measurementDate,
      unit: selectedType.unit
    };
    
    const result = await addMeasurement(newMeasurement);
    
    if (result) {
      toast.success(`${selectedType.name} ${t('Measurement added')}`);
      setMeasurementValue('');
    }
  };
  
  const handleDeleteMeasurement = async (id: string) => {
    await deleteMeasurement(id);
    toast.success(t('Measurement deleted'));
  };

  const getMeasurementsByType = (type: string) => {
    const typeMeasurements = measurements.filter(m => m.type === type);
    console.log(`getMeasurementsByType(${type}):`, typeMeasurements);
    return typeMeasurements;
  };
  
  const getLatestMeasurement = (type: string) => {
    const typeMeasurements = getMeasurementsByType(type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return typeMeasurements.length > 0 ? typeMeasurements[0] : null;
  };
  
  const prepareMeasurementDataForChart = (type: string) => {
    const typeData = getMeasurementsByType(type);
    console.log(`prepareMeasurementDataForChart(${type}) - raw data:`, typeData);
    
    const chartData = typeData.map(m => ({
      date: format(parseISO(m.date), 'MMM d'),
      value: m.value,
      originalDate: m.date
    })).sort((a, b) => {
      const dateA = new Date(a.originalDate || a.date);
      const dateB = new Date(b.originalDate || b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log(`prepareMeasurementDataForChart(${type}) - formatted chart data:`, chartData);
    return chartData;
  };

  const handleAddPhoto = async (photoData: any) => {
    await addPhoto(photoData);
  };

  const handleEditPhoto = (photo: ProgressPhoto) => {
    console.log('Edit photo:', photo);
    setSelectedPhoto(photo);
    setShowEditPhotoDialog(true);
  };

  const handleUpdatePhoto = async (id: string, updates: Partial<ProgressPhoto>) => {
    await updatePhoto(id, updates);
    setSelectedPhoto(null);
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    if (isPremium) {
      await updatePhoto(id, { is_favorite: isFavorite });
    }
  };

  const handleToggleMilestone = async (id: string, isMilestone: boolean) => {
    if (isPremium) {
      await updatePhoto(id, { is_milestone: isMilestone });
    }
  };

  const handleSelectPhotoForComparison = (photo: ProgressPhoto) => {
    if (comparisonPhotos.length < 2) {
      setComparisonPhotos(prev => [...prev, photo]);
    } else {
      setComparisonPhotos([photo]);
    }
  };

  const startComparison = () => {
    if (comparisonPhotos.length === 2) {
      setShowComparisonDialog(true);
      setSelectionMode(false);
    }
  };

  const cancelComparison = () => {
    setComparisonPhotos([]);
    setSelectionMode(false);
  };

  const filteredPhotos = photos.filter(photo => {
    if (categoryFilter !== 'all' && photo.category !== categoryFilter) return false;
    if (tagFilter !== 'all' && !photo.tags.includes(tagFilter)) return false;
    if (showFavoritesOnly && !photo.is_favorite) return false;
    if (showMilestonesOnly && !photo.is_milestone) return false;
    return true;
  });

  const allTags = Array.from(new Set(photos.flatMap(photo => photo.tags))).sort();

  const enabledMeasurementTypes = measurementTypes.filter(type => type.enabled);

  const milestonesCount = photos.filter(p => p.is_milestone).length;
  const favoritesCount = photos.filter(p => p.is_favorite).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {!user && <LoginPrompt />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("progress")}</h1>
          <p className="text-muted-foreground mt-1">{t("Track your fitness journey and body transformation")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                data-dialog-trigger="true"
                className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add measurement")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{t("Add measurement")}</DialogTitle>
                <DialogDescription>{t("Track your body measurements")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("type")}</label>
                  <select 
                    className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5"
                    value={measurementType}
                    onChange={(e) => setMeasurementType(e.target.value)}
                  >
                    {enabledMeasurementTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {t(type.id) || type.name}
                      </option>
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
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("date")}</label>
                  <Input 
                    type="date" 
                    value={measurementDate}
                    onChange={(e) => setMeasurementDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button onClick={handleAddMeasurement} className="w-full rounded-xl">
                  {t("add")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {initialized && (
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className={`grid mb-4 ${showPhotosTab ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="weight">{t("Weight")}</TabsTrigger>
            <TabsTrigger value="measurements">{t("Measurements")}</TabsTrigger>
            {showPhotosTab && <TabsTrigger value="photos">{t("Photos")}</TabsTrigger>}
          </TabsList>
        
        <TabsContent value="weight" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <WeightTracker />
          </div>
        </TabsContent>
        
        <TabsContent value="measurements" className="space-y-6">
          {/* Quick Stats - Latest Measurements */}
          {enabledMeasurementTypes.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {enabledMeasurementTypes.slice(0, 4).map((type, index) => {
                const latestMeasurement = getLatestMeasurement(type.id);
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-emerald-500 to-emerald-600', 
                  'from-amber-500 to-amber-600',
                  'from-purple-500 to-purple-600'
                ];
                const iconColors = ['text-blue-500', 'text-emerald-500', 'text-amber-500', 'text-purple-500'];
                
                return (
                  <Card key={type.id} className="border-0 shadow-md overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${colors[index % colors.length]}`} />
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Ruler className={`h-4 w-4 ${iconColors[index % iconColors.length]}`} />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {getDisplayName(type)}
                        </p>
                      </div>
                      <p className="text-2xl font-bold">
                        {latestMeasurement ? latestMeasurement.value : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{type.unit}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            {/* All Measurements Card */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  {t("Body measurements")}
                </h3>
                <div className="space-y-3">
                  {enabledMeasurementTypes.map(type => {
                    const latestMeasurement = getLatestMeasurement(type.id);
                    
                    return (
                      <div key={type.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Ruler className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{getDisplayName(type)}</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {latestMeasurement ? `${latestMeasurement.value} ${type.unit}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                  
                  {enabledMeasurementTypes.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Ruler className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {t("No measurements enabled")}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {t("Enable measurements in Settings")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Measurement History Card */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  {t("Measurement history")}
                </h3>
                {measurements.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {[...measurements]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(measurement => {
                        const measurementTypeInfo = measurementTypes.find(type => type.id === measurement.type);
                        return (
                          <div key={measurement.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Ruler className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {measurementTypeInfo ? getDisplayName(measurementTypeInfo) : measurement.type}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(measurement.date), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{measurement.value} {measurement.unit}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:text-destructive"
                                onClick={() => handleDeleteMeasurement(measurement.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {t("No measurements yet")}
                    </p>
                    <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="true"]')?.click()}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t("Add first measurement")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Measurement Trends Chart */}
            {measurements.length > 0 && enabledMeasurementTypes.length > 0 && (
              <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      {t("Measurement Trends")}
                    </h3>
                    <Tabs defaultValue={enabledMeasurementTypes[0]?.id} className="w-full">
                      <TabsList className={`mb-4 w-full ${isMobile ? 'grid h-auto p-2' : 'flex flex-wrap'}`} style={isMobile ? { gridTemplateColumns: `repeat(${Math.min(enabledMeasurementTypes.length, 2)}, 1fr)` } : undefined}>
                        {enabledMeasurementTypes.map(type => {
                          const hasData = getMeasurementsByType(type.id).length > 0;
                          return (
                            <TabsTrigger key={type.id} value={type.id} disabled={!hasData} className={isMobile ? 'text-xs py-2 px-1' : ''}>
                              {isMobile ? getDisplayName(type) : `${getDisplayName(type)} ${hasData ? `(${getMeasurementsByType(type.id).length})` : ''}`}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                      
                      {enabledMeasurementTypes.map(type => (
                        <TabsContent key={type.id} value={type.id}>
                          {getMeasurementsByType(type.id).length > 0 ? (
                            <div className={`${isMobile ? 'h-[250px]' : 'h-[300px]'} w-full`}>
                              <ProgressChart
                                data={prepareMeasurementDataForChart(type.id)}
                                title=""
                                label={type.unit}
                                color="#4F46E5"
                              />
                            </div>
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              {t("noDataForThisMeasurement")}
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
        
      {showPhotosTab && (
          <TabsContent value="photos" className="space-y-6">
            <>
              {/* Photo Stats - Always visible */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("Total Photos")}
                      </p>
                    </div>
                    <p className="text-2xl font-bold">{photos.length}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("Milestones")}
                      </p>
                    </div>
                    <p className="text-2xl font-bold">{milestonesCount}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("Favorites")}
                      </p>
                    </div>
                    <p className="text-2xl font-bold">{favoritesCount}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Grid className="h-4 w-4 text-emerald-500" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("Categories")}
                      </p>
                    </div>
                    <p className="text-2xl font-bold">{new Set(photos.map(p => p.category)).size}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setShowAddPhotoDialog(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("Add Photo")}
                      </Button>
                      
                      {isPremium && !selectionMode ? (
                        <Button
                          variant="outline"
                          onClick={() => setSelectionMode(true)}
                          disabled={photos.length < 2}
                        >
                          <ArrowLeftRight className="mr-2 h-4 w-4" />
                          {t("Compare")}
                        </Button>
                      ) : isPremium && selectionMode ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={startComparison}
                            disabled={comparisonPhotos.length !== 2}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t("Compare Selected")} ({comparisonPhotos.length}/2)
                          </Button>
                          <Button variant="outline" onClick={cancelComparison}>
                            {t("Cancel")}
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    {isPremium && (
                      <div className="flex gap-2">
                        <Button
                          variant={photoViewMode === 'grid' ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setPhotoViewMode('grid')}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={photoViewMode === 'timeline' ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setPhotoViewMode('timeline')}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {isPremium && (
                    <div className="flex flex-wrap gap-4 items-center">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder={t("All Categories")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("All Categories")}</SelectItem>
                          {PHOTO_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {allTags.length > 0 && (
                        <Select value={tagFilter} onValueChange={setTagFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder={t("All Tags")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("All Tags")}</SelectItem>
                            {allTags.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <Button
                        variant={showFavoritesOnly ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                        {t("Favorites")}
                      </Button>

                      <Button
                        variant={showMilestonesOnly ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowMilestonesOnly(!showMilestonesOnly)}
                      >
                        <Star className={`h-4 w-4 mr-1 ${showMilestonesOnly ? 'fill-current' : ''}`} />
                        {t("Milestones")}
                      </Button>
                    </div>
                  )}

                  {isPremium && photoViewMode === 'timeline' ? (
                    <ProgressTimeline
                      photos={filteredPhotos}
                      onEditPhoto={handleEditPhoto}
                      onDeletePhoto={deletePhoto}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleMilestone={handleToggleMilestone}
                    />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredPhotos.map(photo => (
                        <ProgressPhotoCard
                          key={photo.id}
                          photo={photo}
                          onEdit={handleEditPhoto}
                          onDelete={deletePhoto}
                          onToggleFavorite={handleToggleFavorite}
                          onToggleMilestone={handleToggleMilestone}
                          onSelect={handleSelectPhotoForComparison}
                          isSelected={comparisonPhotos.some(p => p.id === photo.id)}
                          selectionMode={selectionMode && isPremium}
                          subscriptionTier={currentPlan}
                        />
                      ))}
                    </div>
                  )}

                  {filteredPhotos.length === 0 && photos.length > 0 && isPremium && (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Filter className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">{t("No Photos Match Your Filters")}</h3>
                      <p>{t("Try adjusting your filters to see more photos.")}</p>
                    </div>
                  )}

                  {photos.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Camera className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">{t("Start Your Progress Journey")}</h3>
                      <p className="mb-6">{t("Take your first progress photo to begin tracking your transformation.")}</p>
                      <Button onClick={() => setShowAddPhotoDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("Add Your First Photo")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>

            <AddProgressPhotoDialog
              open={showAddPhotoDialog}
              onOpenChange={setShowAddPhotoDialog}
              onAddPhoto={handleAddPhoto}
            />

            <EditProgressPhotoDialog
              open={showEditPhotoDialog}
              onOpenChange={setShowEditPhotoDialog}
              photo={selectedPhoto}
              onUpdatePhoto={handleUpdatePhoto}
              subscriptionTier={currentPlan}
            />

            {isPremium && (
              <PhotoComparisonDialog
                open={showComparisonDialog}
                onOpenChange={setShowComparisonDialog}
                photos={comparisonPhotos}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
      )}
    </div>
  );
}

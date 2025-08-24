import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Camera, Plus, Upload, Weight, ArrowUp, ArrowDown, X, Trash2, Filter, Grid, Clock, ArrowLeftRight, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { subscription_tier, test_mode, test_subscription_tier, loading: subscriptionLoading } = useSubscription();
  
  // Determine current plan - show premium features if we have pro/premium data or still loading
  const currentPlan = test_mode ? test_subscription_tier : subscription_tier;
  const isFree = !subscriptionLoading && currentPlan === 'free';
  const isPro = currentPlan === 'pro';
  const isPremium = currentPlan === 'premium';
  // Show photos tab unless we're confirmed to be on free plan and not loading
  const showPhotosTab = !isFree;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("progress")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button data-dialog-trigger="true">
                <Plus className="mr-2 h-4 w-4" />
                {t("Add measurement")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Add measurement")}</DialogTitle>
                <DialogDescription>{t("Track your body measurements")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("type")}</label>
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("Body measurements")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enabledMeasurementTypes.map(type => {
                  const latestMeasurement = getLatestMeasurement(type.id);
                  
                  return (
                    <div key={type.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t(type.id) || type.name}</span>
                      <span className="text-sm">
                        {latestMeasurement ? `${latestMeasurement.value} ${type.unit}` : '—'}
                      </span>
                    </div>
                  );
                })}
                
                {enabledMeasurementTypes.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      {t("No measurements enabled")}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {t("Enable measurements in Settings")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("Measurement history")}</CardTitle>
              </CardHeader>
              <CardContent>
                {measurements.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto">
                    <Table className="w-full text-sm">
                      <TableHeader>
                        <TableRow className="border-b border-border">
                          <TableHead className="pb-2 font-medium">{t("date")}</TableHead>
                          <TableHead className="pb-2 font-medium">{t("measurement")}</TableHead>
                          <TableHead className="pb-2 font-medium text-right">{t("value")}</TableHead>
                          <TableHead className="pb-2 font-medium w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...measurements]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(measurement => {
                            const measurementTypeInfo = measurementTypes.find(type => type.id === measurement.type);
                            return (
                              <TableRow key={measurement.id} className="border-b border-border">
                                <TableCell className="py-3">{format(parseISO(measurement.date), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="py-3">
                                  {t(measurement.type) || measurementTypeInfo?.name || measurement.type}
                                </TableCell>
                                <TableCell className="py-3 text-right">{measurement.value} {measurement.unit}</TableCell>
                                <TableCell className="py-3">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteMeasurement(measurement.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        }
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
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
            
            {measurements.length > 0 && enabledMeasurementTypes.length > 0 && (
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Measurement Trends")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={enabledMeasurementTypes[0]?.id} className="w-full">
                      <TabsList className="mb-4 flex flex-wrap">
                        {enabledMeasurementTypes.map(type => {
                          const hasData = getMeasurementsByType(type.id).length > 0;
                          return (
                            <TabsTrigger key={type.id} value={type.id} disabled={!hasData}>
                              {t(type.id) || type.name} {hasData && `(${getMeasurementsByType(type.id).length})`}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                      
                      {enabledMeasurementTypes.map(type => (
                        <TabsContent key={type.id} value={type.id}>
                          {getMeasurementsByType(type.id).length > 0 ? (
                            <div className="h-[300px]">
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
            {isFree ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upgrade to Access Photos</h3>
                  <p className="text-muted-foreground mb-6">Progress photos are available with Pro and Premium plans.</p>
                  <Button onClick={() => window.dispatchEvent(new CustomEvent('openSubscriptionModal'))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Photos")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setShowAddPhotoDialog(true)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Photo
                        </Button>
                        
                        {isPremium && !selectionMode ? (
                          <Button
                            variant="outline"
                            onClick={() => setSelectionMode(true)}
                            disabled={photos.length < 2}
                          >
                            <ArrowLeftRight className="mr-2 h-4 w-4" />
                            Compare
                          </Button>
                        ) : isPremium && selectionMode ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={startComparison}
                              disabled={comparisonPhotos.length !== 2}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Compare Selected ({comparisonPhotos.length}/2)
                            </Button>
                            <Button variant="outline" onClick={cancelComparison}>
                              Cancel
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
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
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
                              <SelectValue placeholder="All Tags" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Tags</SelectItem>
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
                          Favorites
                        </Button>

                        <Button
                          variant={showMilestonesOnly ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setShowMilestonesOnly(!showMilestonesOnly)}
                        >
                          <Star className={`h-4 w-4 mr-1 ${showMilestonesOnly ? 'fill-current' : ''}`} />
                          Milestones
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
                        <h3 className="text-lg font-medium mb-2">No Photos Match Your Filters</h3>
                        <p>Try adjusting your filters to see more photos.</p>
                      </div>
                    )}

                    {photos.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <Camera className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Start Your Progress Journey</h3>
                        <p className="mb-6">Take your first progress photo to begin tracking your transformation.</p>
                        <Button onClick={() => setShowAddPhotoDialog(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Photo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

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
    </div>
  );
}

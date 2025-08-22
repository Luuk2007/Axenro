
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Camera, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WeightTracker from '@/components/progress/WeightTracker';
import ProgressTimeline from '@/components/progress/ProgressTimeline';
import AddProgressPhotoDialog from '@/components/progress/AddProgressPhotoDialog';
import PhotoComparisonDialog from '@/components/progress/PhotoComparisonDialog';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { ProgressPhoto } from '@/types/progressPhotos';
import { useSubscription } from '@/hooks/useSubscription';

const Progress = () => {
  const { t } = useLanguage();
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<ProgressPhoto | null>(null);
  const { photos, addPhoto, updatePhoto, deletePhoto } = useProgressPhotos();
  const { subscription_tier, test_mode, test_subscription_tier } = useSubscription();

  // Get current tier (test mode or real subscription)
  const currentTier = test_mode ? test_subscription_tier : subscription_tier;

  const handleAddPhoto = async (photoData: Omit<ProgressPhoto, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await addPhoto(photoData);
      setAddPhotoOpen(false);
    } catch (error) {
      console.error('Failed to add photo:', error);
    }
  };

  const handleEditPhoto = (photo: ProgressPhoto) => {
    setEditingPhoto(photo);
    setAddPhotoOpen(true);
  };

  const handleUpdatePhoto = async (photoData: Omit<ProgressPhoto, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingPhoto) return;
    
    try {
      await updatePhoto(editingPhoto.id, photoData);
      setEditingPhoto(null);
      setAddPhotoOpen(false);
    } catch (error) {
      console.error('Failed to update photo:', error);
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await updatePhoto(id, { is_favorite: isFavorite });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleToggleMilestone = async (id: string, isMilestone: boolean) => {
    try {
      await updatePhoto(id, { is_milestone: isMilestone });
    } catch (error) {
      console.error('Failed to toggle milestone:', error);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await deletePhoto(id);
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  // Check if progress photos should be shown based on subscription
  const showProgressPhotos = currentTier !== 'free';
  
  // Check if full photo features should be shown (premium only)
  const showFullPhotoFeatures = currentTier === 'premium';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-semibold">{t("progress")}</h1>
      </div>

      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weight">{t("Weight tracking")}</TabsTrigger>
          {showProgressPhotos && (
            <TabsTrigger value="photos">{t("Photos")}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="weight" className="space-y-6">
          <WeightTracker />
        </TabsContent>

        {showProgressPhotos && (
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {t("Progress photos")}
                </CardTitle>
                <div className="flex gap-2">
                  {showFullPhotoFeatures && photos.length >= 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setCompareOpen(true)}
                      className="text-sm"
                    >
                      {t("Compare Photos")}
                    </Button>
                  )}
                  <Button onClick={() => setAddPhotoOpen(true)} className="text-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("Add photo")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressTimeline
                  photos={photos}
                  onEditPhoto={showFullPhotoFeatures ? handleEditPhoto : undefined}
                  onDeletePhoto={handleDeletePhoto}
                  onToggleFavorite={showFullPhotoFeatures ? handleToggleFavorite : undefined}
                  onToggleMilestone={showFullPhotoFeatures ? handleToggleMilestone : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <AddProgressPhotoDialog
        open={addPhotoOpen}
        onOpenChange={(open) => {
          setAddPhotoOpen(open);
          if (!open) setEditingPhoto(null);
        }}
        onSubmit={editingPhoto ? handleUpdatePhoto : handleAddPhoto}
        initialData={editingPhoto || undefined}
        showFullFeatures={showFullPhotoFeatures}
      />

      {showFullPhotoFeatures && (
        <PhotoComparisonDialog
          open={compareOpen}
          onOpenChange={setCompareOpen}
          photos={photos}
        />
      )}
    </div>
  );
};

export default Progress;

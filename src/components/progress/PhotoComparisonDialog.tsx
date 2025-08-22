
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowLeftRight, Calendar } from 'lucide-react';
import { ProgressPhoto } from '@/types/progressPhotos';
import { format } from 'date-fns';

interface PhotoComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: ProgressPhoto[];
  selectedPhotos?: [ProgressPhoto, ProgressPhoto];
}

export default function PhotoComparisonDialog({
  open,
  onOpenChange,
  photos,
  selectedPhotos
}: PhotoComparisonDialogProps) {
  const [photo1, setPhoto1] = useState<ProgressPhoto | null>(selectedPhotos?.[0] || null);
  const [photo2, setPhoto2] = useState<ProgressPhoto | null>(selectedPhotos?.[1] || null);
  const [sliderPosition, setSliderPosition] = useState([50]);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');

  const availablePhotos = photos.filter(p => p.id !== photo1?.id && p.id !== photo2?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Compare Progress Photos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Before Photo</label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 ${
                      photo1?.id === photo.id ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setPhoto1(photo)}
                  >
                    <img 
                      src={photo.image_url} 
                      alt={`Progress ${photo.date}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                      {format(new Date(photo.date), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">After Photo</label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 ${
                      photo2?.id === photo.id ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setPhoto2(photo)}
                  >
                    <img 
                      src={photo.image_url} 
                      alt={`Progress ${photo.date}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                      {format(new Date(photo.date), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          {photo1 && photo2 && (
            <div className="flex justify-center gap-2">
              <Button
                variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
                onClick={() => setViewMode('side-by-side')}
              >
                Side by Side
              </Button>
              <Button
                variant={viewMode === 'slider' ? 'default' : 'outline'}
                onClick={() => setViewMode('slider')}
              >
                Slider Overlay
              </Button>
            </div>
          )}

          {/* Comparison View */}
          {photo1 && photo2 && (
            <div className="space-y-4">
              {viewMode === 'side-by-side' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photo1.image_url} 
                        alt="Before" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{format(new Date(photo1.date), 'MMM d, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{photo1.category}</div>
                      {photo1.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{photo1.notes}</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photo2.image_url} 
                        alt="After" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{format(new Date(photo2.date), 'MMM d, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{photo2.category}</div>
                      {photo2.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{photo2.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={photo1.image_url} 
                      alt="Before" 
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)` }}
                    >
                      <img 
                        src={photo2.image_url} 
                        alt="After" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                      style={{ left: `${sliderPosition[0]}%` }}
                    />
                  </div>
                  
                  <div className="px-4">
                    <Slider
                      value={sliderPosition}
                      onValueChange={setSliderPosition}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-medium">{format(new Date(photo1.date), 'MMM d, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{photo1.category}</div>
                    </div>
                    <div>
                      <div className="font-medium">{format(new Date(photo2.date), 'MMM d, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{photo2.category}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Difference */}
              {photo1 && photo2 && (
                <div className="text-center text-sm text-muted-foreground">
                  {Math.abs(
                    Math.floor(
                      (new Date(photo2.date).getTime() - new Date(photo1.date).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )
                  )} days difference
                </div>
              )}
            </div>
          )}

          {!photo1 || !photo2 ? (
            <div className="text-center py-8 text-muted-foreground">
              Select two photos to compare
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

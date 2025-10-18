
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  Calendar, 
  MessageSquare, 
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProgressPhoto } from '@/types/progressPhotos';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressPhotoCardProps {
  photo: ProgressPhoto;
  onEdit?: (photo: ProgressPhoto) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onToggleMilestone?: (id: string, isMilestone: boolean) => void;
  onSelect?: (photo: ProgressPhoto) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  subscriptionTier?: string;
}

export default function ProgressPhotoCard({
  photo,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleMilestone,
  onSelect,
  isSelected,
  selectionMode,
  subscriptionTier
}: ProgressPhotoCardProps) {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isPremium = subscriptionTier === 'premium';
  const isPro = subscriptionTier === 'pro';

  // Construct the proper public URL for the image
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, use it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a storage path, construct the public URL
    if (imageUrl.startsWith('progress-images/')) {
      return `https://rfxaxuvteslmfefdeaje.supabase.co/storage/v1/object/public/${imageUrl}`;
    }
    
    // If it's just a filename, construct the full path
    return `https://rfxaxuvteslmfefdeaje.supabase.co/storage/v1/object/public/progress-images/${imageUrl}`;
  };

  const imageUrl = getImageUrl(photo.image_url);

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', imageUrl, e);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${selectionMode ? 'cursor-pointer' : ''}`}
      onClick={selectionMode ? () => onSelect?.(photo) : undefined}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Progress from ${photo.date}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">📷</div>
                <div className="text-xs">No image URL</div>
              </div>
            </div>
          )}
          
          {/* Loading placeholder */}
          {imageUrl && !imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">{t("Loading...")}</div>
            </div>
          )}

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
              <div className="text-center text-red-500">
                <div className="text-2xl mb-2">❌</div>
                <div className="text-xs">{t("Failed to load")}</div>
                <div className="text-xs mt-1 px-2 break-all">{imageUrl}</div>
              </div>
            </div>
          )}

          {/* Overlay with icons - show for premium */}
          {isPremium && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute bottom-2 left-2 flex gap-2">
                {photo.is_milestone && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {t("Milestone")}
                  </Badge>
                )}
                {photo.is_favorite && (
                  <Badge variant="secondary" className="text-xs">
                    <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Selection indicator for comparison mode */}
          {selectionMode && isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          )}

          {/* Action menu - show for pro and premium */}
          {!selectionMode && (isPro || isPremium) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(photo)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("Edit")}
                  </DropdownMenuItem>
                  {isPremium && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onToggleFavorite?.(photo.id, !photo.is_favorite)}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${photo.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                        {photo.is_favorite ? t("Remove from Favorites") : t("Add to Favorites")}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onToggleMilestone?.(photo.id, !photo.is_milestone)}
                      >
                        <Star className={`h-4 w-4 mr-2 ${photo.is_milestone ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        {photo.is_milestone ? t("Remove Milestone") : t("Mark as Milestone")}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(photo.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("Delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Photo Details */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(photo.date), 'MMM d, yyyy')}
            </div>
            {/* Show category for premium users, limited for pro */}
            {(isPremium || isPro) && (
              <Badge variant="outline" className="text-xs">
                {photo.category}
              </Badge>
            )}
          </div>

          {/* Only show notes for premium */}
          {isPremium && photo.notes && (
            <div className="flex items-start gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <p className="line-clamp-2">{photo.notes}</p>
            </div>
          )}

          {/* Only show tags for premium */}
          {isPremium && photo.tags && photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {photo.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {photo.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{photo.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

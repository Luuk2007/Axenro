
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, Star, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ProgressPhoto } from '@/types/progressPhotos';
import { cn } from '@/lib/utils';

interface ProgressPhotoCardProps {
  photo: ProgressPhoto;
  onEdit?: (photo: ProgressPhoto) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onToggleMilestone?: (id: string, isMilestone: boolean) => void;
}

export default function ProgressPhotoCard({
  photo,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleMilestone
}: ProgressPhotoCardProps) {
  const showAdvancedFeatures = !!(onEdit || onToggleFavorite || onToggleMilestone);

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={photo.image_url}
          alt={`Progress photo from ${format(parseISO(photo.date), 'MMM d, yyyy')}`}
          className="w-full aspect-square object-cover"
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(photo)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onToggleFavorite && (
                  <DropdownMenuItem onClick={() => onToggleFavorite(photo.id, !photo.is_favorite)}>
                    <Heart className={cn("mr-2 h-4 w-4", photo.is_favorite && "fill-current")} />
                    {photo.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  </DropdownMenuItem>
                )}
                {onToggleMilestone && (
                  <DropdownMenuItem onClick={() => onToggleMilestone(photo.id, !photo.is_milestone)}>
                    <Star className={cn("mr-2 h-4 w-4", photo.is_milestone && "fill-current")} />
                    {photo.is_milestone ? 'Remove milestone' : 'Mark as milestone'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(photo.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {photo.is_favorite && showAdvancedFeatures && (
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
              <Heart className="w-3 h-3 mr-1 fill-current" />
              Favorite
            </Badge>
          )}
          {photo.is_milestone && showAdvancedFeatures && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Milestone
            </Badge>
          )}
        </div>
      </div>

      {/* Photo details */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">
            {format(parseISO(photo.date), 'MMM d, yyyy')}
          </p>
          <Badge variant="outline" className="text-xs">
            {photo.category}
          </Badge>
        </div>
        
        {photo.notes && showAdvancedFeatures && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {photo.notes}
          </p>
        )}
        
        {photo.tags && photo.tags.length > 0 && showAdvancedFeatures && (
          <div className="flex flex-wrap gap-1">
            {photo.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {photo.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{photo.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

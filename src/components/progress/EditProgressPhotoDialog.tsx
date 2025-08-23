
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, ImageOff } from 'lucide-react';
import { ProgressPhoto, PHOTO_CATEGORIES, COMMON_TAGS } from '@/types/progressPhotos';
import { format } from 'date-fns';

interface EditProgressPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: ProgressPhoto | null;
  onUpdatePhoto: (id: string, updates: Partial<ProgressPhoto>) => Promise<void>;
  subscriptionTier?: string;
}

export default function EditProgressPhotoDialog({
  open,
  onOpenChange,
  photo,
  onUpdatePhoto,
  subscriptionTier
}: EditProgressPhotoDialogProps) {
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);
  const [date, setDate] = useState('');
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPro = subscriptionTier === 'pro';
  const isPremium = subscriptionTier === 'premium';
  const hasAdvancedFeatures = isPremium; // Only premium gets advanced features

  useEffect(() => {
    if (photo) {
      setNotes(photo.notes || '');
      setCategory(photo.category);
      setTags(photo.tags || []);
      setIsFavorite(photo.is_favorite);
      setIsMilestone(photo.is_milestone);
      setDate(photo.date);
      setImageError(false);
    }
  }, [photo]);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!photo) return;
    
    setLoading(true);
    try {
      const updates: Partial<ProgressPhoto> = {
        date,
        category: category as any,
      };

      // Only include advanced features for premium users
      if (hasAdvancedFeatures) {
        updates.notes = notes;
        updates.tags = tags;
        updates.is_favorite = isFavorite;
        updates.is_milestone = isMilestone;
      }

      await onUpdatePhoto(photo.id, updates);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (url.includes('supabase.co') && !url.includes('?')) {
      return `${url}?t=${Date.now()}`;
    }
    return url;
  };

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Progress Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {!imageError ? (
              <img
                src={getImageUrl(photo.image_url)}
                alt={`Progress from ${photo.date}`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="text-center text-gray-500">
                  <ImageOff className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Image not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Category - Available for both Pro and Premium */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PHOTO_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Features - Only for Premium */}
          {hasAdvancedFeatures && (
            <>
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this photo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTag(newTag)}
                    disabled={!newTag || tags.includes(newTag)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {COMMON_TAGS.filter(tag => !tags.includes(tag)).slice(0, 6).map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => handleAddTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Favorite and Milestone toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="favorite">Mark as Favorite</Label>
                  <Switch
                    id="favorite"
                    checked={isFavorite}
                    onCheckedChange={setIsFavorite}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="milestone">Mark as Milestone</Label>
                  <Switch
                    id="milestone"
                    checked={isMilestone}
                    onCheckedChange={setIsMilestone}
                  />
                </div>
              </div>
            </>
          )}

          {isPro && !isPremium && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p>💎 Upgrade to Premium to unlock notes, tags, favorites, and milestone features!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Star } from 'lucide-react';
import { ProgressPhoto, PHOTO_CATEGORIES, COMMON_TAGS } from '@/types/progressPhotos';

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
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ProgressPhoto['category']>('front');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPremium = subscriptionTier === 'premium';
  const isPro = subscriptionTier === 'pro';

  // Ensure proper image URL formatting
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://rfxaxuvteslmfefdeaje.supabase.co/storage/v1/object/public/progress-images/${url}`;
  };

  useEffect(() => {
    if (photo) {
      setDate(photo.date);
      setNotes(photo.notes || '');
      setCategory(photo.category);
      setTags(photo.tags || []);
      setIsFavorite(photo.is_favorite);
      setIsMilestone(photo.is_milestone);
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

  const handleSubmit = async () => {
    if (!photo) return;

    setLoading(true);
    try {
      const updates: Partial<ProgressPhoto> = {
        date,
        notes: isPremium ? notes : '',
        category: isPremium ? category : photo.category,
        tags: isPremium ? tags : [],
        is_favorite: isPremium ? isFavorite : false,
        is_milestone: isPremium ? isMilestone : false,
      };

      await onUpdatePhoto(photo.id, updates);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating photo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Progress Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={getImageUrl(photo.image_url)}
                alt="Progress photo"
                className="max-w-full max-h-64 object-contain rounded-lg"
                crossOrigin="anonymous"
              />
            </div>
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

          {/* Category - Only for Premium */}
          {isPremium && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ProgressPhoto['category'])}>
                <SelectTrigger>
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
          )}

          {/* Notes - Only for Premium */}
          {isPremium && (
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
          )}

          {/* Tags - Only for Premium */}
          {isPremium && (
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
                  placeholder="Add a tag..."
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
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_TAGS.map(tag => (
                  <Button
                    key={tag}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleAddTag(tag)}
                    disabled={tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Favorite and Milestone - Only for Premium */}
          {isPremium && (
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="favorite" className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Mark as Favorite
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="milestone"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="milestone" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Mark as Milestone
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

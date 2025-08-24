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

  // Use direct image URL since bucket is now public
  const imageUrl = photo?.image_url;

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
        notes: isPremium ? notes : photo.notes, // Keep existing notes for pro
        category: (isPremium || isPro) ? category : photo.category, // Pro can edit category
        tags: isPremium ? tags : photo.tags, // Keep existing tags for pro
        is_favorite: isPremium ? isFavorite : photo.is_favorite, // Keep existing for pro
        is_milestone: isPremium ? isMilestone : photo.is_milestone, // Keep existing for pro
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
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Progress photo"
                  className="max-w-full max-h-64 object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Failed to load image in edit dialog:', imageUrl);
                    e.currentTarget.style.filter = 'grayscale(1)';
                    e.currentTarget.style.opacity = '0.5';
                  }}
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">📷</div>
                    <div className="text-sm">Image not available</div>
                  </div>
                </div>
              )}
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

          {/* Category - For Pro and Premium */}
          {(isPro || isPremium) && (
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

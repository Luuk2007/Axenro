
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, ImageIcon } from 'lucide-react';
import { ProgressPhoto, PHOTO_CATEGORIES, COMMON_TAGS } from '@/types/progressPhotos';

interface EditProgressPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: ProgressPhoto | null;
  onUpdatePhoto: (id: string, updates: Partial<ProgressPhoto>) => void;
}

export default function EditProgressPhotoDialog({
  open,
  onOpenChange,
  photo,
  onUpdatePhoto
}: EditProgressPhotoDialogProps) {
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('front');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (photo) {
      setDate(photo.date);
      setCategory(photo.category);
      setNotes(photo.notes || '');
      setTags(photo.tags || []);
      setIsFavorite(photo.is_favorite);
      setIsMilestone(photo.is_milestone);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [photo]);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return;

    onUpdatePhoto(photo.id, {
      date,
      category: category as any,
      notes,
      tags,
      is_favorite: isFavorite,
      is_milestone: isMilestone
    });
    
    onOpenChange(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (!photo) return null;

  // Create a proper image URL
  const imageUrl = photo.image_url?.startsWith('http') 
    ? photo.image_url 
    : `https://rfxaxuvteslmfefdeaje.supabase.co/storage/v1/object/public/${photo.image_url}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Progress Photo</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <Label>Current Photo</Label>
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt={`Progress from ${photo.date}`}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
                style={{ display: imageError ? 'none' : 'block' }}
              />
              
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Image not available</p>
                    <p className="text-xs opacity-60">Upload issue - contact support</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this photo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
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
                  onKeyDown={(e) => {
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
                  disabled={!newTag}
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
                    className="text-xs h-6"
                    onClick={() => handleAddTag(tag)}
                    disabled={tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Favorite</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Milestone</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Photo
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

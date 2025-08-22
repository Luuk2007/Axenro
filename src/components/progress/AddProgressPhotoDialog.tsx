
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PHOTO_CATEGORIES, COMMON_TAGS } from '@/types/progressPhotos';

interface AddProgressPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPhoto: (photoData: any) => Promise<void>;
  subscriptionTier?: string;
}

export default function AddProgressPhotoDialog({
  open,
  onOpenChange,
  onAddPhoto,
  subscriptionTier
}: AddProgressPhotoDialogProps) {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<string>('front');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);

  const isPremium = subscriptionTier === 'premium';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag: string) => {
    if (isPremium && tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (isPremium) {
      setTags(tags.filter(tag => tag !== tagToRemove));
    }
  };

  const addCustomTag = () => {
    if (isPremium && customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !session) return;

    try {
      setUploading(true);

      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('progress-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('progress-images')
        .getPublicUrl(fileName);

      // Add photo data
      await onAddPhoto({
        image_url: publicUrl,
        date,
        notes: isPremium ? notes : '',
        category,
        tags: isPremium ? tags : [],
        is_favorite: isPremium ? isFavorite : false,
        is_milestone: isPremium ? isMilestone : false
      });

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setCategory('front');
      setTags([]);
      setIsFavorite(false);
      setIsMilestone(false);
      
      onOpenChange(false);
      toast.success('Progress photo added successfully');
    } catch (error) {
      console.error('Error adding photo:', error);
      toast.error('Failed to add progress photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Progress Photo</DialogTitle>
          <DialogDescription>
            Upload a new progress photo to track your transformation journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-primary hover:text-primary/80">Click to upload</span>
                      {' or drag and drop'}
                    </Label>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
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

          {/* Premium Features */}
          {isPremium && (
            <>
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this photo..."
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="space-y-3">
                  {/* Selected Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer">
                          {tag}
                          <X 
                            className="h-3 w-3 ml-1" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Common Tags */}
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TAGS.filter(tag => !tags.includes(tag)).map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Custom Tag Input */}
                  <div className="flex gap-2">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Add custom tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    />
                    <Button type="button" variant="outline" onClick={addCustomTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Milestone and Favorite toggles */}
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMilestone}
                    onChange={(e) => setIsMilestone(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Mark as milestone</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Add to favorites</span>
                </label>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!imageFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Add Photo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

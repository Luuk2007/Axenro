
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProgressPhoto } from '@/types/progressPhotos';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddProgressPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<ProgressPhoto, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  initialData?: ProgressPhoto;
  showFullFeatures?: boolean;
}

const categories = [
  { value: 'front', label: 'Front' },
  { value: 'side', label: 'Side' },
  { value: 'back', label: 'Back' },
  { value: 'flexed', label: 'Flexed' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'other', label: 'Other' },
];

export default function AddProgressPhotoDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  showFullFeatures = true
}: AddProgressPhotoDialogProps) {
  const { session } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>('front');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSelectedDate(new Date(initialData.date));
      setCategory(initialData.category);
      setNotes(initialData.notes || '');
      setTags(initialData.tags || []);
      setImageUrl(initialData.image_url);
    } else {
      // Reset form
      setSelectedDate(new Date());
      setCategory('front');
      setNotes('');
      setTags([]);
      setImageUrl('');
      setImageFile(null);
    }
  }, [initialData, open]);

  const handleImageUpload = async (file: File) => {
    if (!session) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('progress-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('progress-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast.error('Please upload an image');
      return;
    }

    setIsSubmitting(true);
    try {
      const photoData = {
        image_url: imageUrl,
        date: format(selectedDate, 'yyyy-MM-dd'),
        category: category as ProgressPhoto['category'],
        notes: showFullFeatures ? notes : null,
        tags: showFullFeatures ? tags : [],
        is_milestone: false,
        is_favorite: false,
      };

      await onSubmit(photoData);
    } catch (error) {
      console.error('Error submitting photo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Progress Photo' : 'Add Progress Photo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Progress photo"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </span>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes - only show for premium users */}
          {showFullFeatures && (
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this photo..."
                rows={3}
              />
            </div>
          )}

          {/* Tags - only show for premium users */}
          {showFullFeatures && (
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!imageUrl || uploading || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add Photo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

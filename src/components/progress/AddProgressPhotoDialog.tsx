
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PHOTO_CATEGORIES, COMMON_TAGS } from '@/types/progressPhotos';
import { useSubscription } from '@/hooks/useSubscription';

interface AddProgressPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPhoto: (photoData: any) => Promise<void>;
}

export default function AddProgressPhotoDialog({
  open,
  onOpenChange,
  onAddPhoto
}: AddProgressPhotoDialogProps) {
  const { user } = useAuth();
  const { subscription_tier, test_mode, test_subscription_tier } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<string>('front');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Determine current plan
  const currentPlan = test_mode ? test_subscription_tier : subscription_tier;
  const isPremium = currentPlan === 'premium';
  const isPro = currentPlan === 'pro';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('progress-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('progress-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setCategory('front');
    setTags([]);
    setNewTag('');
    setIsFavorite(false);
    setIsMilestone(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(selectedFile);
      
      const photoData = {
        image_url: imageUrl,
        date,
        notes: isPremium ? notes : '', // Only premium can add notes
        tags: isPremium ? tags : [], // Only premium can add tags
        category: isPremium ? category : 'other', // Pro users can't select category
        is_milestone: isPremium ? isMilestone : false, // Only premium can mark milestones
        is_favorite: isPremium ? isFavorite : false, // Only premium can mark favorites
      };

      await onAddPhoto(photoData);
      resetForm();
      onOpenChange(false);
      toast.success('Progress photo added successfully!');
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
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <Label>Select Photo</Label>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-600 mb-2">
                  Click to upload a photo
                </div>
                <div className="text-sm text-gray-500">
                  PNG, JPG up to 10MB
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">{t("Date")}</Label>
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
              <Label htmlFor="category">{t("Category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select category")} />
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
              <Label htmlFor="notes">Notes (Optional)</Label>
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
              <Label>Tags (Optional)</Label>
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

          {/* Pro Plan Notice */}
          {isPro && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <strong>Pro Plan:</strong> You can upload photos with basic information. 
                Upgrade to Premium for advanced features like notes, tags, categories, and more!
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Add Photo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

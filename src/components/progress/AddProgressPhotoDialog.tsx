
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Plus } from 'lucide-react';
import { PHOTO_CATEGORIES, COMMON_TAGS } from '@/types/progressPhotos';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddProgressPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPhoto: (photoData: {
    image_url: string;
    date: string;
    notes?: string;
    tags: string[];
    category: string;
    is_milestone: boolean;
    is_favorite: boolean;
  }) => Promise<void>;
}

export default function AddProgressPhotoDialog({
  open,
  onOpenChange,
  onAddPhoto
}: AddProgressPhotoDialogProps) {
  const { t } = useLanguage();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('front');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCapturePhoto = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context && videoRef.current.videoWidth > 0) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageData);
        
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        
        setShowCamera(false);
      }
    }
  };

  const handleSelectFromGallery = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          setCapturedImage(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSave = async () => {
    if (!capturedImage) return;
    
    setLoading(true);
    try {
      await onAddPhoto({
        image_url: capturedImage,
        date,
        notes: notes.trim() || undefined,
        tags,
        category,
        is_milestone: isMilestone,
        is_favorite: isFavorite
      });
      
      // Reset form
      setCapturedImage(null);
      setNotes('');
      setTags([]);
      setCustomTag('');
      setIsMilestone(false);
      setIsFavorite(false);
      setCategory('front');
      setDate(new Date().toISOString().split('T')[0]);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving photo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('Add Progress Photo')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Photo Capture Section */}
          {!capturedImage && !showCamera && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleCapturePhoto} className="h-32 flex-col">
                  <Camera className="h-8 w-8 mb-2" />
                  Take Photo
                </Button>
                <Button onClick={handleSelectFromGallery} variant="outline" className="h-32 flex-col">
                  <Upload className="h-8 w-8 mb-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          )}

          {/* Camera View */}
          {showCamera && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>
              <div className="flex justify-center">
                <Button onClick={takePicture} size="lg" className="rounded-full h-16 w-16 p-0">
                  <Camera className="h-8 w-8" />
                </Button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img src={capturedImage} alt="Progress" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setCapturedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Photo Details Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="How are you feeling? What workout did you do? Any milestones?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
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

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Special Flags */}
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMilestone}
                    onChange={(e) => setIsMilestone(e.target.checked)}
                    className="rounded"
                  />
                  <span>Mark as Milestone</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="rounded"
                  />
                  <span>Mark as Favorite</span>
                </label>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={loading || !capturedImage}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Progress Photo'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

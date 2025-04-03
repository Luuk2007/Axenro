
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
}

export default function ProgressPhotos() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('progressPhotos');
    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch (error) {
        console.error('Error parsing progress photos:', error);
      }
    }
  }, []);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('progressPhotos', JSON.stringify(photos));
  }, [photos]);

  const handleAddPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Create a FileReader to read the image data
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const newPhoto: ProgressPhoto = {
          id: `photo-${Date.now()}`,
          url: event.target.result.toString(),
          date: new Date().toISOString(),
        };
        
        setPhotos(prev => [newPhoto, ...prev]);
        toast.success('Photo added successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    reader.readAsDataURL(file);
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    toast.success('Photo deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("progressPhotos")}</h2>
        <Button size="sm" onClick={handleAddPhoto}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addPhoto")}
        </Button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square rounded-lg overflow-hidden relative hover:scale-[1.02] transition-transform"
            >
              <img
                src={photo.url}
                alt={`Progress photo from ${new Date(photo.date).toLocaleDateString()}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-xs">
                  {new Date(photo.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="bg-secondary/50 rounded-full p-4 mb-4">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">{t("noProgressPhotos")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("startTrackingVisualProgress")}
          </p>
          <Button onClick={handleAddPhoto}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addFirstPhoto")}
          </Button>
        </div>
      )}
    </div>
  );
}

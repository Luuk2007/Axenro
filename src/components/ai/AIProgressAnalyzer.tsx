
import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

export default function AIProgressAnalyzer() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState({
    weight: '',
    bodyFat: '',
    muscle: '',
    chest: '',
    waist: '',
    arms: ''
  });
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysis, setAnalysis] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error(t('Please upload at least one progress photo'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-progress-analyzer', {
        body: {
          images: images,
          measurements: measurements,
          analysisTitle: analysisTitle || 'Progress Analysis'
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success(t('Progress analysis completed!'));
    } catch (error) {
      console.error('Error analyzing progress:', error);
      toast.error(t('Failed to analyze progress'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('Analysis Title')}</Label>
          <Input
            id="title"
            placeholder={t('e.g., 3 Month Transformation')}
            value={analysisTitle}
            onChange={(e) => setAnalysisTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('Progress Photos')} *</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t('Upload Photos')}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                {t('Upload multiple progress photos for comparison')}
              </p>
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Progress ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('Body Measurements (Optional)')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight" className="text-sm">{t('Weight (kg/lbs)')}</Label>
              <Input
                id="weight"
                placeholder="70"
                value={measurements.weight}
                onChange={(e) => setMeasurements(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bodyFat" className="text-sm">{t('Body Fat %')}</Label>
              <Input
                id="bodyFat"
                placeholder="15"
                value={measurements.bodyFat}
                onChange={(e) => setMeasurements(prev => ({ ...prev, bodyFat: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="chest" className="text-sm">{t('Chest (cm/in)')}</Label>
              <Input
                id="chest"
                placeholder="100"
                value={measurements.chest}
                onChange={(e) => setMeasurements(prev => ({ ...prev, chest: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="waist" className="text-sm">{t('Waist (cm/in)')}</Label>
              <Input
                id="waist"
                placeholder="80"
                value={measurements.waist}
                onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="arms" className="text-sm">{t('Arms (cm/in)')}</Label>
              <Input
                id="arms"
                placeholder="35"
                value={measurements.arms}
                onChange={(e) => setMeasurements(prev => ({ ...prev, arms: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading || images.length === 0} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('Analyzing Progress...')}
            </>
          ) : (
            t('Analyze Progress')
          )}
        </Button>
      </form>

      {analysis && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('AI Progress Analysis')}</h3>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {analysis}
          </div>
        </Card>
      )}
    </div>
  );
}

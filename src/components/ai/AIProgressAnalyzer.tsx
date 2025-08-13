
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, X, Trash2, Eye } from 'lucide-react';

interface SavedAnalysis {
  id: string;
  title: string;
  created_at: string;
  analysis_text: string;
}

export default function AIProgressAnalyzer() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState({
    weight: '',
    bodyFat: '',
    chest: '',
    waist: '',
    arms: ''
  });
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      loadSavedAnalyses();
    }
  }, [session]);

  const loadSavedAnalyses = async () => {
    if (!session) return;
    
    setLoadingAnalyses(true);
    try {
      const { data, error } = await supabase
        .from('ai_progress_analysis')
        .select('id, title, created_at, analysis_text')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedAnalyses(data || []);
    } catch (error) {
      console.error('Error loading saved analyses:', error);
      toast.error('Failed to load saved analyses');
    } finally {
      setLoadingAnalyses(false);
    }
  };

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
    if (!session) {
      toast.error('Please sign in to use AI features');
      return;
    }

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
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setSelectedAnalysis(null);
      toast.success(t('Progress analysis completed!'));
      
      // Reload saved analyses to show the new one
      await loadSavedAnalyses();
    } catch (error) {
      console.error('Error analyzing progress:', error);
      toast.error(t('Failed to analyze progress'));
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('ai_progress_analysis')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
        setAnalysis('');
      }
      toast.success('Analysis deleted successfully');
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  };

  const viewAnalysis = (analysisData: SavedAnalysis) => {
    setSelectedAnalysis(analysisData);
    setAnalysis(analysisData.analysis_text);
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{t('Please sign in to access AI progress analysis')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saved Analyses Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">My Progress Analyses</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSavedAnalyses}
            disabled={loadingAnalyses}
          >
            {loadingAnalyses ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
        
        {savedAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedAnalyses.map((analysisData) => (
              <div key={analysisData.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{analysisData.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(analysisData.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewAnalysis(analysisData)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteAnalysis(analysisData.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No progress analyses yet. Create your first analysis below!
          </p>
        )}
      </Card>

      {/* Form Section */}
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

      {/* Analysis Display */}
      {analysis && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedAnalysis ? selectedAnalysis.title : t('AI Progress Analysis')}
            </h3>
            {selectedAnalysis && (
              <div className="text-sm text-muted-foreground">
                Created: {new Date(selectedAnalysis.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans">{analysis}</pre>
          </div>
        </Card>
      )}
    </div>
  );
}

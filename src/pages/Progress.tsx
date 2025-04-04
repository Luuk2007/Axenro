
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeightTracker } from '@/components/progress/WeightTracker';
import { MeasurementsTracker } from '@/components/progress/MeasurementsTracker';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Progress() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{t('progress')}</h1>
        </header>

        <Tabs defaultValue="weight" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="weight">{t('weight')}</TabsTrigger>
            <TabsTrigger value="measurements">{t('measurements')}</TabsTrigger>
            <TabsTrigger value="photos">{t('photos')}</TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-6">
            <WeightTracker />
          </TabsContent>

          <TabsContent value="measurements">
            <MeasurementsTracker />
          </TabsContent>

          <TabsContent value="photos">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{t('progressPhotos')}</h2>
              <button className="btn btn-primary">
                + {t('addPhoto')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo upload and display would go here */}
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400">No photos yet</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

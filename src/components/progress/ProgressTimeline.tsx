
import React from 'react';
import { ProgressPhoto } from '@/types/progressPhotos';
import ProgressPhotoCard from './ProgressPhotoCard';
import { format, parseISO, differenceInMonths } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressTimelineProps {
  photos: ProgressPhoto[];
  onEditPhoto?: (photo: ProgressPhoto) => void;
  onDeletePhoto?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onToggleMilestone?: (id: string, isMilestone: boolean) => void;
}

export default function ProgressTimeline({
  photos,
  onEditPhoto,
  onDeletePhoto,
  onToggleFavorite,
  onToggleMilestone
}: ProgressTimelineProps) {
  const { t } = useLanguage();
  // Group photos by month
  const groupedPhotos = photos.reduce((groups, photo) => {
    const monthKey = format(parseISO(photo.date), 'yyyy-MM');
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(photo);
    return groups;
  }, {} as Record<string, ProgressPhoto[]>);

  const sortedMonths = Object.keys(groupedPhotos).sort().reverse();

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          📸
        </div>
        <h3 className="text-lg font-medium mb-2">{t("No Progress Photos Yet")}</h3>
        <p>{t("Start your transformation journey by adding your first progress photo.")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedMonths.map((monthKey, monthIndex) => {
        const monthPhotos = groupedPhotos[monthKey];
        const monthDate = parseISO(`${monthKey}-01`);
        const isFirstMonth = monthIndex === sortedMonths.length - 1;
        const monthsFromStart = isFirstMonth ? 0 : differenceInMonths(
          monthDate, 
          parseISO(`${sortedMonths[sortedMonths.length - 1]}-01`)
        );

        return (
          <div key={monthKey} className="relative">
            {/* Timeline connector */}
            {monthIndex < sortedMonths.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-full bg-border -z-10" />
            )}
            
            {/* Month header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center font-semibold text-primary text-sm">
                {monthsFromStart}M
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {format(monthDate, 'MMMM yyyy')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {monthPhotos.length} {monthPhotos.length !== 1 ? t("multiple_photos") : t("single_photo")}
                  {monthsFromStart > 0 && ` • ${monthsFromStart} ${t("months in")}`}
                </p>
              </div>
            </div>

            {/* Photos grid */}
            <div className="ml-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {monthPhotos
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(photo => (
                  <ProgressPhotoCard
                    key={photo.id}
                    photo={photo}
                    onEdit={onEditPhoto}
                    onDelete={onDeletePhoto}
                    onToggleFavorite={onToggleFavorite}
                    onToggleMilestone={onToggleMilestone}
                  />
                ))}
            </div>

            {/* Milestones in this month */}
            {monthPhotos.some(p => p.is_milestone) && (
              <div className="ml-16 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">🎉 {t("Milestones This Month")}</h4>
                <div className="space-y-1">
                  {monthPhotos
                    .filter(p => p.is_milestone)
                    .map(photo => (
                      <div key={photo.id} className="text-sm text-yellow-700">
                        {format(parseISO(photo.date), 'MMM d')} - {photo.notes || t("Milestone achieved!")}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


export interface ProgressPhoto {
  id: string;
  user_id: string;
  image_url: string;
  date: string;
  notes?: string;
  tags: string[];
  category: 'front' | 'side' | 'back' | 'flexed' | 'relaxed' | 'other';
  is_milestone: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhotoComparison {
  photo1: ProgressPhoto;
  photo2: ProgressPhoto;
}

export const PHOTO_CATEGORIES = [
  { value: 'front', label: 'Front' },
  { value: 'side', label: 'Side' },
  { value: 'back', label: 'Back' },
  { value: 'flexed', label: 'Flexed' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'other', label: 'Other' }
] as const;

export const COMMON_TAGS = [
  'PR day',
  'Cutting',
  'Bulking',
  'Maintenance',
  'Transformation',
  'Milestone',
  'Post-workout',
  'Morning',
  'Competition prep',
  'Recovery'
];

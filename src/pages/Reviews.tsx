
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    profile_picture_url: string | null;
  } | null;
}

export default function Reviews() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch approved reviews with profile information
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          content,
          rating,
          created_at,
          user_id,
          profiles (
            full_name,
            profile_picture_url
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
      
      // Transform the data to match our Review interface
      return (data || []).map(review => ({
        ...review,
        profiles: review.profiles || null
      })) as Review[];
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (newReview: { title: string; content: string; rating: number }) => {
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          title: newReview.title,
          content: newReview.content,
          rating: newReview.rating,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(t('Review submitted successfully! It will be reviewed before appearing publicly.'));
      setTitle('');
      setContent('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('Please log in to submit a review'));
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error(t('Please fill in all required fields'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({ title, content, rating });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={cn(
              "transition-colors",
              interactive && "hover:text-yellow-500 cursor-pointer",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                "h-5 w-5",
                star <= rating
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('Reviews')}</h1>
        <p className="text-muted-foreground">
          {t('Share your experience with Axenro and read what others have to say')}
        </p>
      </div>

      {/* Submit Review Form */}
      {user && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('Write a Review')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  {t('Title')} *
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('Give your review a title')}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium mb-2">
                  {t('Rating')} *
                </label>
                {renderStars(rating, true, setRating)}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  {t('Review')} *
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('Share your thoughts about Axenro...')}
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('Submitting...') : t('Submit Review')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t('Please log in to write a review')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{t('Customer Reviews')}</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-4 bg-muted rounded w-1/6" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={review.profiles?.profile_picture_url || ''} 
                        alt={review.profiles?.full_name || 'Anonymous'} 
                      />
                      <AvatarFallback>
                        {review.profiles?.full_name 
                          ? review.profiles.full_name.charAt(0).toUpperCase()
                          : 'A'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{review.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {review.profiles?.full_name || 'Anonymous'} • {formatDate(review.created_at)}
                          </p>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-foreground leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t('No reviews yet. Be the first to share your experience!')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

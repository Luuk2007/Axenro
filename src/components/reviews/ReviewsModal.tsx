
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  is_approved: boolean;
}

interface ReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReviewsModal({ open, onOpenChange }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      fetchReviews();
    }
  }, [open]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (rating === 0 || !title.trim() || !content.trim()) {
      toast.error('Please fill in all fields and select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          rating,
          title: title.trim(),
          content: content.trim()
        });

      if (error) throw error;

      toast.success('Review submitted successfully! It will be reviewed before appearing publicly.');
      setShowAddForm(false);
      setRating(0);
      setTitle('');
      setContent('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={cn(
              interactive && 'cursor-pointer hover:text-yellow-400 transition-colors',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            {user && !showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Review
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-accent/10">
              <h3 className="font-semibold">Write a Review</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(rating, true, setRating)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Review title..."
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{review.title}</h4>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-muted-foreground text-sm">{review.content}</p>
                  <div className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                    {review.user_id === user?.id && !review.is_approved && (
                      <span className=" ml-2 text-yellow-600">(Pending approval)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

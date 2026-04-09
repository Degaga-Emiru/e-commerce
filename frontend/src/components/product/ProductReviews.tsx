'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Trash2, Edit3, 
  CheckCircle, Image as ImageIcon, Plus, 
  X, Loader2, ThumbsUp, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { getImageUrl } from '@/util/imageUtils';

interface Review {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
}

interface ProductReviewsProps {
  productId: number;
  canReview: boolean;
  onReviewChange?: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, canReview, onReviewChange }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/product/${productId}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const res = await api.post('/reviews/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setImages([...images, res.data.imageUrl]);
        toast.success('Image uploaded!');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Please write a comment');
    
    setSubmitting(true);
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview.id}`, { rating, comment });
        toast.success('Review updated!');
      } else {
        await api.post('/reviews', { productId, rating, comment, images });
        toast.success('Review submitted!');
      }
      resetForm();
      fetchReviews();
      if (onReviewChange) onReviewChange();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save review');
    } finally {
      setSubmitting(true); // Wait, should be false
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingReview(null);
    setRating(5);
    setComment('');
    setImages([]);
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
      if (onReviewChange) onReviewChange();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setImages(review.images || []);
    setIsFormOpen(true);
  };

  if (loading && reviews.length === 0) {
    return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Customer Reviews <span className="text-gray-300">({reviews.length})</span>
          </h2>
          <p className="text-gray-400 font-medium mt-1">Share your thoughts with the community.</p>
        </div>
        
        {isAuthenticated && canReview && !isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center gap-2"
          >
            <Edit3 size={18} /> Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {isFormOpen && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-100 shadow-xl shadow-orange-500/5 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">{editingReview ? 'Edit Your Review' : 'Create New Review'}</h3>
              <button type="button" onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            {/* Star Rating Select */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star 
                      size={32} 
                      className={star <= rating ? "fill-orange-400 text-orange-400" : "text-gray-200"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Review Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike? How was the quality?"
                rows={4}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all resize-none"
              />
            </div>

            {/* Image Upload */}
            {!editingReview && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Add Photos (Optional)</label>
                <div className="flex flex-wrap gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                      <img src={getImageUrl(img)} alt="Review" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 cursor-pointer transition-all">
                      <Plus size={20} />
                      <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-gray-50">
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : editingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
            <MessageSquare size={64} className="mx-auto text-gray-100 mb-6" />
            <h3 className="text-xl font-black text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-400 font-medium">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex gap-6">
                    {/* User Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg shadow-orange-500/10">
                      {review.user.profilePictureUrl ? (
                        <img src={getImageUrl(review.user.profilePictureUrl)} alt={review.user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-black text-2xl uppercase">{review.user.firstName[0]}</span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-gray-900 text-xl">{review.user.firstName} {review.user.lastName}</h4>
                        {review.verifiedPurchase && (
                          <span className="flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-green-100">
                            <CheckCircle size={10} /> Verified Purchase
                          </span>
                        )}
                      </div>
                      
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-gray-200"} 
                          />
                        ))}
                        <span className="text-xs text-gray-400 font-bold ml-2">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      
                      <p className="text-gray-600 text-lg font-medium leading-relaxed max-w-2xl">{review.comment}</p>
                      
                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-4">
                          {review.images.map((img, i) => (
                            <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 cursor-zoom-in hover:scale-105 transition-transform">
                              <img src={getImageUrl(img)} alt="Customer feedback" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Review Actions */}
                      <div className="flex items-center gap-6 pt-6 pt-6">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-black text-[10px] uppercase tracking-widest group/btn">
                          <ThumbsUp size={16} className="group-hover/btn:scale-110 transition-transform" />
                          Helpful ({review.helpfulVotes})
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-black text-[10px] uppercase tracking-widest">
                          <MessageCircle size={16} /> Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit/Delete for Owner */}
                  {isAuthenticated && authUser?.id === review.user.id && (
                    <div className="flex md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(review)}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-white hover:shadow-md rounded-2xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-3 bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-white hover:shadow-md rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

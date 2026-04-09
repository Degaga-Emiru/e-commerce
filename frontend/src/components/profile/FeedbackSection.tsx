'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Star, MessageCircle, 
  ChevronRight, Calendar, Loader2, Edit3 
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface Review {
  id: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

const FeedbackSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/me');
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      toast.error('Could not load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < rating ? "fill-orange-400 text-orange-400" : "text-gray-200"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <MessageCircle className="text-emerald-500" size={24} />
        </div>
        <div>
          <h3 className="font-black text-emerald-900 text-lg">Your Influence</h3>
          <p className="text-sm text-emerald-700 font-medium mt-1 leading-relaxed">
            Your reviews help other shoppers make better decisions and help us improve our catalog. 
            All reviews are moderated for quality.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {reviews.map((review) => (
              <div key={review.id} className="p-8 hover:bg-gray-50/50 transition-colors group relative">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                      {review.product.imageUrl ? (
                        <img 
                          src={review.product.imageUrl} 
                          alt={review.product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <MessageSquare size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                      <h4 className="font-black text-gray-900 text-lg group-hover:text-orange-500 transition-colors line-clamp-1">{review.product.name}</h4>
                      {renderStars(review.rating)}
                      <p className="text-sm text-gray-600 font-medium leading-relaxed italic mt-2">"{review.comment}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-auto md:mt-0">
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      review.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {review.isApproved ? 'Approved' : 'Pending Moderation'}
                    </div>
                    
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-orange-500 hover:shadow-md transition-all">
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={40} className="text-gray-200" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">No Reviews Yet</h4>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">
              Share your thoughts on the items you've purchased and help the community!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;

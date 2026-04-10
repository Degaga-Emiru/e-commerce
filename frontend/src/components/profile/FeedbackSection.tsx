'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Star, MessageCircle, 
  ChevronRight, Calendar, Loader2, Edit3 
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Review {
  id: number;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  images: string[];
  user?: {
    firstName: string;
    lastName: string;
  };
}

const FeedbackSection = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/admin/reviews' : '/reviews/me';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setReviews(res.data.reviews || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      toast.error('Could not load feedback history');
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

  if (user?.role === 'SELLER') {
    return (
      <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100 text-center">
        <MessageCircle size={48} className="text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-black text-indigo-900 mb-2">Customer Feedback Dashboard</h3>
        <p className="text-indigo-700/70 font-medium max-w-sm mx-auto mb-8">
          Sellers view and respond to customer feedback directly within the Seller Portal's product management section.
        </p>
        <Link 
          href="/seller/dashboard"
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          Go to Seller Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={isAdmin ? "bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-start gap-4" : "bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-start gap-4"}>
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <MessageCircle className={isAdmin ? "text-indigo-500" : "text-emerald-500"} size={24} />
        </div>
        <div>
          <h3 className={isAdmin ? "font-black text-indigo-900 text-lg" : "font-black text-emerald-900 text-lg"}>
            {isAdmin ? 'Platform Customer Feedback' : 'Reviews & Feedback'}
          </h3>
          <p className={isAdmin ? "text-sm text-indigo-700 font-medium mt-1 leading-relaxed" : "text-sm text-emerald-700 font-medium mt-1 leading-relaxed"}>
            {isAdmin 
              ? 'Monitoring all platform reviews to ensure quality and customer satisfaction across all products.'
              : "These are the reviews you have shared on products you've purchased. Your feedback ensures a quality marketplace."
            }
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-gray-50 text-left">
            {reviews.map((review) => (
              <div key={review.id} className="p-8 hover:bg-gray-50/50 transition-colors group relative">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform flex items-center justify-center">
                      {review.images && review.images.length > 0 ? (
                        <img 
                          src={review.images[0]} 
                          alt={review.productName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <MessageSquare size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        {isAdmin && review.user && (
                          <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">
                            {review.user.firstName} {review.user.lastName}
                          </span>
                        )}
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        {review.verifiedPurchase && (
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Verified Purchase</p>
                        )}
                      </div>
                      <h4 className="font-black text-gray-900 text-lg group-hover:text-orange-500 transition-colors line-clamp-1">
                        {review.productName}
                      </h4>
                      {renderStars(review.rating)}
                      <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:border-orange-100 transition-colors">
                        <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-auto md:mt-0">
                    <Link 
                      href={`/product/${review.productId}`}
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-orange-500 hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">View Product</span>
                      <ChevronRight size={18} />
                    </Link>
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
            <h4 className="text-xl font-black text-gray-900 mb-2">No Reviews Found</h4>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">
              Once you start sharing your thoughts on purchased products, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;

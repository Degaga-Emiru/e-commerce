'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

interface Review { id: number; rating: number; comment: string; user?: { firstName: string; lastName: string }; createdAt: string; }

interface Props {
  productId: number;
  canReview?: boolean; // true if user has purchased and product is delivered
}

export default function ProductReviews({ productId, canReview }: Props) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = () => {
    api.get(`/reviews/product/${productId}`).then(r => {
      const data = r.data?.reviews || r.data?.data || r.data;
      const reviewArray = Array.isArray(data) ? data : [];
      setReviews(reviewArray);
      if (reviewArray.length > 0) setAvgRating(reviewArray.reduce((a, r: any) => a + r.rating, 0) / reviewArray.length);
    }).catch(console.error);
  };
  useEffect(() => { fetchReviews(); }, [productId]);

  const submit = async () => {
    if (!form.comment.trim()) return toast.error('Please write a review');
    setSubmitting(true);
    try {
      await api.post('/reviews', { productId, ...form });
      toast.success('Review submitted!');
      setShowForm(false);
      setForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const StarRow = ({ rating, interactive }: { rating: number; interactive?: boolean }) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i}
          size={interactive ? 24 : 16}
          fill={i <= rating ? '#f59e0b' : 'transparent'}
          color={i <= rating ? '#f59e0b' : '#94a3b8'}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={interactive ? () => setForm(p => ({ ...p, rating: i })) : undefined}
        />
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: '3rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Customer Reviews</h3>
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <StarRow rating={Math.round(avgRating)} />
              <span style={{ color: '#64748b', fontSize: 14 }}>{avgRating.toFixed(1)} ({reviews.length} review{reviews.length > 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        {isAuthenticated && canReview && !showForm && (
          <button onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.25rem', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem', color: '#1e293b', fontWeight: 700 }}>Your Review</h4>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 13, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 8 }}>Rating</label>
            <StarRow rating={form.rating} interactive />
          </div>
          <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} rows={4} placeholder="Share your experience with this product…"
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.75rem', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button onClick={submit} disabled={submitting} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem 1.5rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first to review!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
                    {r.user?.firstName} {r.user?.lastName}
                  </p>
                  <StarRow rating={r.rating} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Minus, Plus, Loader2, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import ProductReviews from '@/components/product/ProductReviews';
import ProductCard from '@/components/product/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isNewUser = user?.isNewUser;
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const variantSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product || res.data.data || res.data);
        
        if (isAuthenticated) {
          try {
            const reviewCheck = await api.get(`/reviews/check?productId=${id}`);
            setCanReview(reviewCheck.data.canReview);
          } catch (e) {
            console.warn('Could not check review eligibility');
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Could not load product details');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        if (!product?.categoryId && !id) return;
        const catId = product?.categoryId;
        const res = await api.get(`/products/filter?categoryId=${catId}`);
        // Filter out current product
        const filtered = (res.data.products || []).filter((p: any) => String(p.id) !== String(id)).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (e) {
        console.warn('Failed to fetch related products');
      }
    };

    if (id) fetchProduct();
    if (product) fetchRelatedProducts();
  }, [id, isAuthenticated, product?.id]);

  const refreshProductData = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product || res.data.data || res.data);
    } catch (error) {
      console.error('Failed to refresh product:', error);
    }
  };

  useEffect(() => {
    if (product?.variants?.length > 0) {
      if (!selectedSize && !selectedColor) {
        setSelectedVariant(null);
        return;
      }
      
      const variant = product.variants.find((v: any) => {
        const sizeMatch = !selectedSize || v.size === selectedSize;
        const colorMatch = !selectedColor || v.color === selectedColor;
        // Strict match: if size exists in variants, it must be selected
        const exactMatch = (selectedSize ? v.size === selectedSize : true) && 
                           (selectedColor ? v.color === selectedColor : true);
        return exactMatch;
      });
      
      // Only set variant if it's a complete match for what's picked
      // If product has both size/color, both must be picked to get a variant
      const hasSizeInVariants = product.variants.some((v: any) => v.size);
      const hasColorInVariants = product.variants.some((v: any) => v.color);
      
      if ((hasSizeInVariants && !selectedSize) || (hasColorInVariants && !selectedColor)) {
        setSelectedVariant(null);
      } else {
        setSelectedVariant(variant);
      }
    }
  }, [selectedSize, selectedColor, product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.variants?.length > 0 && !selectedVariant) {
      toast.error('Please select size and color options first');
      variantSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name || product.title,
      size: selectedVariant?.size,
      color: selectedVariant?.color,
      price: selectedVariant?.price || product.price,
      quantity: quantity,
      image: selectedVariant?.imageUrl || product.imageUrl || product.image
    });
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    if (product.variants?.length > 0 && !selectedVariant) {
      toast.error('Please select size and color options first');
      variantSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    await addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name || product.title,
      size: selectedVariant?.size,
      color: selectedVariant?.color,
      price: selectedVariant?.price || product.price,
      quantity: quantity,
      image: selectedVariant?.imageUrl || product.imageUrl || product.image
    });
    
    router.push('/checkout');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={48} />
    </div>
  );

  if (!product) return <div className="p-20 text-center text-xl font-bold text-gray-400">Product not found</div>;

  const currentPrice = selectedVariant?.price || product.price || 0;
  const displayPrice = currentPrice.toLocaleString() || '0.00';
  const displayImage = selectedVariant?.imageUrl || product.imageUrl || product.image || 'https://via.placeholder.com/800';

  const availableSizes = Array.from(new Set(product.variants?.map((v: any) => v.size).filter(Boolean))) as string[];
  const availableColors = Array.from(new Set(product.variants?.map((v: any) => v.color).filter(Boolean))) as string[];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Gallery */}
        <div className="lg:w-1/2">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-white border border-gray-100 shadow-2xl shadow-orange-500/5">
            <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div className="lg:w-1/2 space-y-8">
          <div>
            <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-xs">
              {product.category?.name || 'Premium Selection'}
            </span>
            <h1 className="text-5xl font-black mt-4 text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-6 mt-6">
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">
                <Star size={18} className="fill-orange-500 text-orange-500" />
                <span className="font-black text-orange-700">{product.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-gray-400 font-bold text-sm uppercase tracking-widest bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                {product.reviewCount || 0} reviews
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-gray-400 font-bold text-xl tracking-tighter">ETB</span>
              {isNewUser ? (
                <>
                  <span className="text-4xl font-black text-gray-400 tracking-tighter line-through">{displayPrice}</span>
                  <span className="text-6xl font-black text-orange-600 tracking-tighter">{(currentPrice * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </>
              ) : (
                <span className="text-6xl font-black text-gray-900 tracking-tighter">{displayPrice}</span>
              )}
            </div>
            {isNewUser && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                <span className="text-green-600 font-bold text-sm">🎉 You qualify for a new user discount! Save 10% with code WELCOME10</span>
              </div>
            )}
            {quantity > 1 && (
              <div className="flex items-center space-x-2 text-orange-600 font-bold">
                <span>Subtotal:</span>
                <span>ETB {((product.price || 0) * quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <p className="text-gray-500 leading-relaxed text-lg font-medium">
            {product.description}
          </p>

          {/* Variants Selection */}
          <div ref={variantSectionRef} className="space-y-6 py-6 scroll-mt-20">
            {availableSizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Size</span>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                        selectedSize === size 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200' 
                          : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableColors.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Color</span>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                        selectedColor === color 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200' 
                          : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color.toLowerCase() }}></span>
                        {color}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedVariant && (
              <div className="text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 inline-block">
                ✓ {selectedVariant.stockQuantity} units available in {selectedVariant.size} / {selectedVariant.color}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-100 p-1 shadow-inner">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-white rounded-xl transition-all"><Minus size={18} /></button>
                <span className="w-12 text-center font-black text-xl text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-white rounded-xl transition-all"><Plus size={18} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 w-full bg-white border-2 border-orange-500 text-orange-500 py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center space-x-4 hover:bg-orange-50 transition-all active:scale-[0.98]"
              >
                <ShoppingCart size={24} />
                <span>Add to Cart</span>
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 w-full bg-orange-500 text-white py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center space-x-4 hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/30 active:scale-[0.98]"
              >
                <Zap size={24} />
                <span>Buy It Now</span>
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <Truck size={24} className="text-orange-500 mb-3" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping</span>
              <span className="text-xs font-bold text-gray-900">Free Global</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <ShieldCheck size={24} className="text-orange-500 mb-3" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Warranty</span>
              <span className="text-xs font-bold text-gray-900">2 Years</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <RefreshCw size={24} className="text-orange-500 mb-3" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Returns</span>
              <span className="text-xs font-bold text-gray-900">30 Days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-32">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">Related Pieces</h2>
            <p className="text-gray-400 font-bold">You might also be interested in these selections</p>
          </div>
        </div>
        
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-gray-100 italic text-gray-400">
            No related pieces found for this collection.
          </div>
        )}
      </div>

      <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Specifications */}
        <div className="space-y-12">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Technical Specs</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Stock Status', value: product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock' },
                { name: 'SKU', value: `EST-${product.id}00${product.name?.length || 0}` },
                { name: 'Brand', value: product.brand || product.seller?.shopName || 'E-Store Premium' },
                { name: 'Category', value: product.category?.name || 'General' },
                ...(product.attributeValues || []).map((av: any) => ({
                  name: av.attributeName,
                  value: av.value
                }))
              ].map((spec) => (
                <div key={spec.name} className="flex justify-between items-center py-5 border-b border-gray-100">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">{spec.name}</span>
                  <span className="text-gray-900 font-extrabold">{spec.value}</span>
                </div>
              ))}
            </div>
        </div>

        {/* Reviews */}
        <div className="bg-gray-50/50 p-12 rounded-[4rem] border border-gray-100">
           <ProductReviews 
             productId={product.id} 
             canReview={canReview} 
             onReviewChange={refreshProductData} 
           />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

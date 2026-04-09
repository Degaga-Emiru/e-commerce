'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

const HERO_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600",
    title: "Seasonal Collection 2026",
    subtitle: "Precision-engineered essentials for modern life."
  },
  {
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
    title: "Pure Tech Performance",
    subtitle: "Discovery excellence in every precision detail."
  },
  {
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600",
    title: "Exclusive Home Decor",
    subtitle: "Elevate your living space with our premium selections."
  }
];

const HeroCarousel = () => {
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[300px] md:h-[480px] lg:h-[600px] w-full overflow-hidden bg-gray-900 group">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentHero}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/60 to-transparent z-10" />
          <img 
            src={HERO_IMAGES[currentHero].url} 
            alt={HERO_IMAGES[currentHero].title} 
            className="w-full h-full object-cover opacity-80 md:opacity-100"
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-16 lg:left-24 z-20 max-w-[280px] md:max-w-xl lg:max-w-2xl space-y-4 md:space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-1.5 md:gap-2 bg-orange-500 text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl"
            >
              <Sparkles size={10} className="md:w-3 md:h-3" /> GLOBAL TRENDS
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-tight uppercase italic tracking-tighter"
            >
              {HERO_IMAGES[currentHero].title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-white/80 text-xs md:text-lg lg:text-xl font-medium italic opacity-90 hidden sm:block"
            >
              {HERO_IMAGES[currentHero].subtitle}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-2 md:pt-0"
            >
              <Link href="/products" className="inline-flex items-center justify-center bg-white text-gray-900 px-5 py-3 md:px-8 md:py-4 rounded-xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-2xl group/btn">
                Shop Everything <ChevronRight size={16} className="ml-1 md:ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 md:gap-3">
        {HERO_IMAGES.map((_, i) => (
           <button 
             key={i} 
             onClick={() => setCurrentHero(i)} 
             className={`h-1.5 rounded-full transition-all duration-300 ${i === currentHero ? 'w-8 md:w-10 bg-orange-500' : 'w-2 md:w-3 bg-white/40 hover:bg-white/60'}`} 
             aria-label={`Go to slide ${i+1}`}
           />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

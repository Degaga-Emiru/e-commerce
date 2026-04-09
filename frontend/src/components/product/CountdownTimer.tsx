'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiryDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState<{h: string, m: string, s: string} | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(expiryDate) - +new Date();
      if (difference > 0) {
        return {
          h: Math.floor(difference / (1000 * 60 * 60)).toString().padStart(2, '0'),
          m: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
          s: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
        };
      }
      return null;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <div className="bg-rose-500 text-white font-black px-2 py-1 rounded-lg text-lg min-w-[40px] text-center shadow-lg shadow-rose-500/20">
          {timeLeft.h}
        </div>
        <span className="text-[8px] font-black text-rose-500 uppercase mt-1 tracking-tighter">Hrs</span>
      </div>
      <span className="text-xl font-black text-rose-500 mb-4 animate-pulse">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-rose-500 text-white font-black px-2 py-1 rounded-lg text-lg min-w-[40px] text-center shadow-lg shadow-rose-500/20">
          {timeLeft.m}
        </div>
        <span className="text-[8px] font-black text-rose-500 uppercase mt-1 tracking-tighter">Min</span>
      </div>
      <span className="text-xl font-black text-rose-500 mb-4 animate-pulse">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-rose-500 text-white font-black px-2 py-1 rounded-lg text-lg min-w-[40px] text-center shadow-lg shadow-rose-500/20">
          {timeLeft.s}
        </div>
        <span className="text-[8px] font-black text-rose-500 uppercase mt-1 tracking-tighter">Sec</span>
      </div>
    </div>
  );
};

export default CountdownTimer;

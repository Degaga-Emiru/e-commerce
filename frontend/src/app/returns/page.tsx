'use client';

import React from 'react';
import { RefreshCcw, ShieldCheck, Truck, Clock } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Returns Protocol</h1>
          <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Uncompromising Satisfaction Guarantee</p>
        </div>

        <section className="bg-gray-50 p-12 rounded-[3.5rem] border border-transparent hover:border-orange-200 transition-all space-y-8">
           <p className="text-xl text-gray-600 font-medium leading-relaxed">
             We understand that precision is subjective. If an elite piece does not align with your expectations, our returns protocol ensures a seamless resolution.
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-200">
             {[
               { icon: <Clock size={24} />, title: "30-Day Window", desc: "Initiate your return within 30 days of delivery for a full refund or exchange." },
               { icon: <ShieldCheck size={24} />, title: "Precision Integrity", desc: "Pieces must be returned in their original, pristine condition with all security tags intact." },
               { icon: <Truck size={24} />, title: "Guided Logistics", desc: "We provide prepaid airfreight labels for all returns meeting our baseline criteria." },
               { icon: <RefreshCcw size={24} />, title: "Rapid Refunds", desc: "Credits are pulsed back to your original payment module within 3-5 business days of inspection." }
             ].map((item, idx) => (
               <div key={idx} className="flex gap-6">
                  <div className="bg-white text-orange-500 w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                  </div>
               </div>
             ))}
           </div>
        </section>

        <div className="prose prose-orange max-w-none space-y-8">
           <h2 className="text-3xl font-black text-gray-900">The Return Loop</h2>
           <div className="space-y-6 text-gray-600 font-medium">
             <p>1. **Initiation**: Visit your dashboard and select 'Request Return' on the relevant precision order.</p>
             <p>2. **Certification**: Our team will pulse a verification of your request within 12 hours.</p>
             <p>3. **Dispatch**: Print the provided concierge labels and secure the piece in its original module.</p>
             <p>4. **Completion**: Upon arrival at our global vault, we perform a final precision audit and pulse your refund.</p>
           </div>
        </div>

        <div className="text-center">
           <button className="bg-gray-900 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto">
             START A RETURN <RefreshCcw size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}

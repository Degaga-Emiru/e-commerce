'use client';

import React from 'react';
import { Database, MousePointer2, Settings, ShieldCheck } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Cookie Pulse</h1>
          <p className="text-gray-400 font-black tracking-widest text-xs uppercase">Optimizing Your Digital Experience</p>
        </div>

        <section className="bg-gray-50 p-12 rounded-[3.5rem] border border-transparent hover:border-orange-200 transition-all space-y-8">
           <p className="text-xl text-gray-600 font-medium leading-relaxed">
             We use precision cookies and digital markers to memorize your preferences, secure your sessions, and accelerate page load speeds across our ecosystem.
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
             {[
               { icon: <ShieldCheck size={20} />, title: "Essential Markers", desc: "Required for authentication, security, and cart persistence. They cannot be deactivated." },
               { icon: <Database size={20} />, title: "Performance Pulse", desc: "Aggregated, anonymous metrics that help us optimize system response times." },
               { icon: <MousePointer2 size={20} />, title: "Preference Memory", desc: "Remembers your language, currency, and curated wishlist settings." },
               { icon: <Settings size={20} />, title: "Control", desc: "Full autonomy to manage your digital footprint via browser settings." }
             ].map((item, idx) => (
               <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-3 text-orange-500 font-black uppercase text-xs tracking-widest">
                    {item.icon} {item.title}
                  </div>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
               </div>
             ))}
           </div>
        </section>

        <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">Consent Management</h2>
            <p className="text-gray-400 font-medium">By continuing to explore our collections, you accept our precision cookie policy.</p>
          </div>
          <button className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shrink-0">Modify Settings</button>
        </div>
      </div>
    </div>
  );
}

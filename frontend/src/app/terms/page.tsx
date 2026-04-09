'use client';

import React from 'react';
import { Gavel, AlertCircle, Scale, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Terms of Engagement</h1>
          <p className="text-gray-400 font-black tracking-widest text-xs uppercase">The Framework of Our Partnership</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[
             { icon: <Scale size={24} />, title: "The Agreement", desc: "By accessing E-STORE, you agree to operate within our ecosystem of precision and professional conduct." },
             { icon: <Gavel size={24} />, title: "Intellectual Assets", desc: "All designs, images, and precision UI elements are the exclusive intellectual property of E-STORE." },
             { icon: <Shield size={24} />, title: "Account Integrity", desc: "Users are responsible for maintaining the security of their access credentials and vault information." },
             { icon: <AlertCircle size={24} />, title: "Usage Limits", desc: "Unauthorized extraction of catalog data or disruption of system pulse speed is strictly prohibited." }
           ].map((item, idx) => (
             <div key={idx} className="bg-gray-50 p-10 rounded-[2.5rem] border border-transparent hover:border-orange-200 transition-all">
                <div className="text-orange-500 mb-6">{item.icon}</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </section>

        <section className="prose prose-orange max-w-none space-y-8">
           <h2 className="text-3xl font-black text-gray-900">Commercial Protocols</h2>
           <div className="space-y-6 text-gray-600 font-medium">
             <p>1. **Pricing Precision**: All totals, including airfreight and taxation, are finalized at checkout. We maintain real-time currency synchronization.</p>
             <p>2. **Order Pulse**: We reserves the right to verify, cancel, or refund orders that do not meet our security or precision criteria.</p>
             <p>3. **Global Compliance**: Our operations adhere strictly to international e-commerce regulations and local jurisdictional requirements.</p>
           </div>
        </section>
      </div>
    </div>
  );
}

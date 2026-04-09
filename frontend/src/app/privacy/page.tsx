'use client';

import React from 'react';
import { ShieldCheck, EyeOff, Lock, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Privacy Vault</h1>
          <p className="text-gray-400 font-black tracking-widest text-xs uppercase">Your Data. Your Control. Protected.</p>
        </div>

        <section className="space-y-8">
          <p className="text-xl text-gray-600 font-medium leading-relaxed">
            At E-STORE, we treat your data as a precision asset. We utilize military-grade encryption and strict access protocols to ensure your digital footprint remains exclusively yours.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Lock />, title: "Encryption", desc: "End-to-end multi-layer encryption for all transactions." },
              { icon: <EyeOff />, title: "Discretion", desc: "We never sell your behavioral data to third-party aggregators." },
              { icon: <FileText />, title: "Transparency", desc: "Clear, concise documentation on every data point we collect." }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-[2.5rem] border border-transparent hover:border-orange-200 transition-all">
                <div className="text-orange-500 mb-4">{item.icon}</div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-12">
          <div className="prose prose-orange max-w-none">
            <h2 className="text-3xl font-black text-gray-900">What We Collect</h2>
            <p className="text-gray-600 font-medium">To provide our elite concierge service, we collect limited essential information:</p>
            <ul className="list-disc pl-6 space-y-4 text-gray-600 font-medium">
              <li>Identity markers (Name, Email, Phone) for order fulfillment.</li>
              <li>Location precision (Shipping Address) for global delivery logistics.</li>
              <li>Pulse interactions (Search history, Wishlist) to refine your discovery experience.</li>
              <li>Payment tokens (Encrypted vault) handled securely via our payment partners.</li>
            </ul>
          </div>
        </section>

        <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white">
          <h2 className="text-2xl font-black mb-4 tracking-tight">Data Sovereignty</h2>
          <p className="text-gray-400 font-medium mb-8">You have the absolute right to request, modify, or permanently delete your vault data at any time via your Account Settings.</p>
          <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all">Request Data Audit</button>
        </div>
      </div>
    </div>
  );
}

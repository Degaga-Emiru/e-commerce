'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

const FAQS = [
  {
    q: "How do I track my precision order?",
    a: "Once your order is verified and dispatched, you will receive a pulse link via email. You can also track your progress in real-time within the 'My Orders' section of your account profile."
  },
  {
    q: "What payment methods are integrated?",
    a: "We exclusively utilize the Chapa gateway for global transactions, supporting Debit/Credit Cards, Telebirr, CBEBirr, and other modern payment modules."
  },
  {
    q: "How does the guest cart sync work?",
    a: "Our ecosystem allows you to add items as a guest. When you eventually login or create an account, our background pulse automatically merges your local cart into your cloud vault."
  },
  {
    q: "What is the return policy for elite pieces?",
    a: "We offer a 30-day precision guarantee. If a piece does not meet our shared standards of excellence, you can initiate a return through our self-service portal."
  },
  {
    q: "Do you ship to my specific region?",
    a: "We maintain airfreight protocols for over 150 countries. During checkout, our location engine will instantly verify delivery availability for your specific address."
  }
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Precision FAQ</h1>
          <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Instant Answers for Elite Exploration</p>
        </div>

        <div className="relative group">
          <input 
            type="text" 
            placeholder="Searching for answers..." 
            className="w-full bg-gray-50 border-none rounded-[2.5rem] py-8 px-16 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-xl transition-all"
          />
          <Search className="absolute left-6 top-8 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={32} />
        </div>

        <div className="space-y-6">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-[2.5rem] border transition-all overflow-hidden ${openIdx === idx ? 'border-orange-500 shadow-xl shadow-orange-500/10' : 'border-gray-100'}`}
            >
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-10 flex items-center justify-between text-left group"
              >
                <span className={`text-xl font-black transition-colors ${openIdx === idx ? 'text-orange-500' : 'text-gray-900'}`}>{faq.q}</span>
                <div className={`p-2 rounded-xl transition-colors ${openIdx === idx ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                  {openIdx === idx ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </button>
              {openIdx === idx && (
                <div className="px-10 pb-10">
                  <p className="text-gray-500 font-medium leading-relaxed text-lg border-t border-gray-50 pt-8 animate-in fade-in slide-in-from-top-2 duration-500">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center bg-gray-900 p-12 rounded-[4rem] text-white">
          <HelpCircle className="mx-auto text-orange-500 mb-6" size={48} />
          <h2 className="text-2xl font-black mb-4 tracking-tight">Still seeking precision?</h2>
          <p className="text-gray-400 font-medium mb-8">Our concierge team is available 24/7 for advanced inquiries.</p>
          <button className="bg-orange-500 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">Connect with Concierge</button>
        </div>
      </div>
    </div>
  );
}

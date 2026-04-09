'use client';

import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Concierge Support</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Elite Assistance for Every Detail</p>
          </div>

          <p className="text-xl text-gray-600 font-medium leading-relaxed">
            Our dedicated concierge team is available to ensure your precision pieces meet your exact standards. Reach out via your preferred channel.
          </p>

          <div className="space-y-8">
            {[
              { icon: <Mail className="text-orange-500" />, title: "Precision Email", value: "concierge@estore-premium.com", sub: "Response within 24 hours" },
              { icon: <Phone className="text-orange-500" />, title: "Concierge Line", value: "+1 (555) 888-PRECISION", sub: "Available Mon-Fri, 9am-6pm EST" },
              { icon: <MapPin className="text-orange-500" />, title: "Global Headquarters", value: "123 Precision Way, Digital Corridor, NY 10001", sub: "By appointment only" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</h3>
                  <p className="text-lg font-black text-gray-900">{item.value}</p>
                  <p className="text-gray-500 font-medium text-xs mt-1">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl shadow-orange-500/10 space-y-10">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
             <div className="bg-orange-500 p-3 rounded-2xl text-white">
               <MessageCircle size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Direct Messaging</h2>
               <p className="text-gray-400 text-sm font-medium">Quick inquiries reach our team instantly.</p>
             </div>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                 <input type="text" placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                 <input type="email" placeholder="john@example.com" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</label>
               <input type="text" placeholder="Product Inquiry" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</label>
               <textarea rows={4} placeholder="How can we assist you today?" className="w-full bg-gray-50 border-none rounded-3xl py-4 px-6 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold resize-none"></textarea>
            </div>
            <button className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 active:scale-[0.98]">
               SEND MESSAGE <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

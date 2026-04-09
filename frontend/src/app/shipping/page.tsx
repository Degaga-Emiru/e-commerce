'use client';

import React from 'react';
import { Truck, Globe, ShieldCheck, Clock } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Shipping Policy</h1>
          <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Precision Delivery Ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              icon: <Globe size={24} />, 
              title: "Global Airfreight", 
              desc: "We utilize premium air cargo carriers to ensure your precision pieces reach you within 5-7 business days across 50+ countries." 
            },
            { 
              icon: <Clock size={24} />, 
              title: "Rapid Processing", 
              desc: "Orders are verified and processed within 24 hours of placement to maintain maximum pulse speed." 
            },
            { 
              icon: <Truck size={24} />, 
              title: "Tracked Excellence", 
              desc: "Every shipment is fully insured and trackable in real-time from our fulfillment center to your doorstep." 
            },
            { 
              icon: <ShieldCheck size={24} />, 
              title: "Secure Packaging", 
              desc: "Pieces are secured in reinforced, eco-friendly protection modules to guarantee arrival in perfect condition." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-10 rounded-[2.5rem] border border-transparent hover:border-orange-200 transition-all group">
              <div className="bg-white text-orange-500 w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <section className="bg-orange-500 p-12 rounded-[3rem] text-white">
          <h2 className="text-3xl font-black mb-6">Rates & Zones</h2>
          <div className="space-y-4 text-orange-100 font-medium">
            <p>• Standard Global Shipping: Free for orders over $200</p>
            <p>• Express Priority: $25 (2-3 business days)</p>
            <p>• Local Precision Delivery: Available in selected metropolitan areas</p>
          </div>
        </section>
      </div>
    </div>
  );
}

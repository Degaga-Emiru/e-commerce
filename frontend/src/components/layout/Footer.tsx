import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-12 mt-32 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>
      
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
        <div className="space-y-8">
          <Link href="/" className="text-3xl font-black tracking-tighter group inline-block">
            E<span className="text-orange-500 group-hover:text-white transition-colors">STORE</span>
          </Link>
          <p className="text-gray-400 font-medium leading-relaxed max-w-xs">
            Defining the precision of modern e-commerce. Curated excellence delivered with unparalleled speed and security.
          </p>
          <div className="flex space-x-5">
            {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Collections</h4>
          <ul className="space-y-4">
            {[
              { name: 'All Products', href: '/products' },
              { name: 'New Arrivals', href: '/products?sortBy=newest' },
              { name: 'Featured Pieces', href: '/products?featured=true' },
              { name: 'Flash Deals', href: '/products?flashSale=true' },
            ].map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-gray-400 font-bold hover:text-orange-500 transition-colors flex items-center group">
                   {link.name} <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Assistance</h4>
          <ul className="space-y-4">
            {[
              { name: 'Order Tracking', href: '/profile/orders' },
              { name: 'Shipping Policy', href: '/shipping' },
              { name: 'Privacy Vault', href: '/privacy' },
              { name: 'Contact Concierge', href: '/contact' },
            ].map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-gray-400 font-bold hover:text-orange-500 transition-colors">
                   {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Contact Info</h4>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <MapPin size={20} className="text-orange-500 mt-1 shrink-0" />
              <span className="text-gray-400 font-medium">123 Precision Way, Digital Corridor, NY 10001</span>
            </li>
            <li className="flex items-center gap-4">
              <Phone size={20} className="text-orange-500 shrink-0" />
              <span className="text-gray-400 font-medium">+1 (555) 888-PRECISION</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail size={20} className="text-orange-500 shrink-0" />
              <span className="text-gray-400 font-medium">concierge@estore-premium.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-24 pt-12 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 font-bold text-sm">
          &copy; {new Date().getFullYear()} E-STORE PREMIUM. All rights reserved.
        </p>
        <div className="flex gap-8 text-gray-600 font-black text-[10px] uppercase tracking-widest">
           <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
           <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
           <Link href="/cookies" className="hover:text-gray-400 transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

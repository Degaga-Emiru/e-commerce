import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-orange-500 mb-4">E-STORE</h3>
          <p className="text-gray-400">
            Your premium destination for quality products and amazing deals.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Shop</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/products" className="hover:text-orange-500">All Products</Link></li>
            <li><Link href="/categories" className="hover:text-orange-500">Categories</Link></li>
            <li><Link href="/featured" className="hover:text-orange-500">Featured Items</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/contact" className="hover:text-orange-500">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-orange-500">FAQs</Link></li>
            <li><Link href="/returns" className="hover:text-orange-500">Returns Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            {/* Social Icons would go here */}
            <span className="text-gray-400 hover:text-orange-500 cursor-pointer">Facebook</span>
            <span className="text-gray-400 hover:text-orange-500 cursor-pointer">Twitter</span>
            <span className="text-gray-400 hover:text-orange-500 cursor-pointer">Instagram</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} E-STORE. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

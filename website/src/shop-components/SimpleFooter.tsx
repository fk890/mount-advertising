'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function SimpleFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-[#0a0a0a] text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <p className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>Mount Advertising</p>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Premium signage and display solutions for your business.</p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>Quick Links</h3>
            <div className="space-y-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
              <Link href="/shop" className="block text-gray-400 hover:text-white text-sm transition-colors">Products</Link>
              <Link href="/shop/cafe" className="block text-gray-400 hover:text-white text-sm transition-colors">Cafe Collection</Link>
              <Link href="/shop/gaming" className="block text-gray-400 hover:text-white text-sm transition-colors">Gaming Collection</Link>
              <Link href="/shop/contact" className="block text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link>
            </div>
          </div>

          {/* Shipping & Returns */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>Shipping & Returns</h3>
            <div className="space-y-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
              <p className="text-gray-400 text-sm">Free shipping on orders over ₹5,000</p>
              <p className="text-gray-400 text-sm"><strong className="text-white">3-day return policy</strong></p>
              <p className="text-gray-400 text-sm">Express delivery available</p>
              <Link href="/shop/shipping-policy" className="block text-gray-400 hover:text-white text-sm transition-colors">Shipping Policy</Link>
              <Link href="/shop/cancellations-and-refunds" className="block text-gray-400 hover:text-white text-sm transition-colors">Cancellations & Refunds</Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>Customer Service</h3>
            <div className="space-y-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
              <p className="text-gray-400 text-sm">24/7 Support</p>
              <p className="text-gray-400 text-sm">Quality Guarantee</p>
              <p className="text-gray-400 text-sm">Secure Payment</p>
              <Link href="/shop/account" className="block text-gray-400 hover:text-white text-sm transition-colors">My Account</Link>
              <Link href="/shop/terms-and-conditions" className="block text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>© {year || 2025} Mount Advertising. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

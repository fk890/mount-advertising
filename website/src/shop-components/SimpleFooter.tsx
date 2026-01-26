'use client'

import { useEffect, useState } from 'react';

export function SimpleFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-white text-gray-900 py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <p className="text-2xl font-bold mb-2 text-gray-900">Mount Advertising</p>
            <p className="text-gray-600 text-sm">Premium signage and display solutions for your business.</p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>            <div className="space-y-2">
              <a href="/shop" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">Products</a>
              <a href="/shop/faq" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">FAQ</a>
              <a href="/shop/track-order" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">Track Order</a>
            </div>
          </div>

          {/* Shipping & Returns */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Shipping & Returns</h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Free shipping on orders over $100</p>
              <p className="text-gray-600 text-sm"><strong>3-day return policy</strong></p>
              <p className="text-gray-600 text-sm">Orders acceptable for return within 3 days of receiving</p>
              <p className="text-gray-600 text-sm">Express delivery available</p>
            </div>
          </div>

          {/* Customer Service */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Service</h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">24/7 Support</p>
              <p className="text-gray-600 text-sm">Quality Guarantee</p>
              <p className="text-gray-600 text-sm">Secure Payment</p>
              <a href="/shop/support" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">Help Center</a>
            </div>
          </div>        </div>        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">© {year || 2026} Mount Advertising. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

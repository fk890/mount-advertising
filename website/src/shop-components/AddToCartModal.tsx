"use client"

import React, { useState, useEffect } from 'react'
import { X, ShoppingBag, ArrowRight, Check } from 'lucide-react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface AddToCartModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productImage: string
  productPrice: string
}

export function AddToCartModal({ 
  isOpen, 
  onClose, 
  productName, 
  productImage, 
  productPrice 
}: AddToCartModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render on client side to prevent hydration issues
  if (!mounted) return null
  
  // Don't render if not open
  if (!isOpen) return null

  const handleContinueShopping = () => {
    onClose()
  }

  const handleViewCart = () => {
    onClose()
    window.location.href = '/shop/cart'
  }

  const handleCheckout = () => {
    onClose()
    window.location.href = '/shop/checkout'
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 ease-out">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-serif font-medium text-center text-gray-900 mb-2">
            Added to Cart!
          </h2>
          
          {/* Product Info */}          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl mb-6">
            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden relative">
              <Image 
                src={productImage} 
                alt={productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                {productName}
              </h3>
              <p className="text-lg font-serif font-semibold text-gray-900 mt-1">
                {productPrice}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Continue Shopping */}
            <button
              onClick={handleContinueShopping}
              className="w-full py-4 text-gray-700 font-medium rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
            >
              Continue Shopping
            </button>

            {/* View Cart */}
            <button
              onClick={handleViewCart}
              className="w-full py-4 bg-gray-100 text-gray-900 font-medium rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>View Cart</span>
            </button>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>Checkout Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AddToCartModal

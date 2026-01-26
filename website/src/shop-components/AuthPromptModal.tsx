'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingBag, Heart, User, ArrowRight } from 'lucide-react'
import { createPortal } from 'react-dom'

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: 'cart' | 'wishlist' | 'account'
  onLogin: () => void
  onSignup: () => void
}

export default function AuthPromptModal({ 
  isOpen, 
  onClose, 
  featureName, 
  onLogin, 
  onSignup 
}: AuthPromptModalProps) {
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  const getFeatureIcon = () => {
    switch (featureName) {
      case 'cart':
        return <ShoppingBag className="h-12 w-12 text-gray-900" />
      case 'wishlist':
        return <Heart className="h-12 w-12 text-red-500" />
      case 'account':
        return <User className="h-12 w-12 text-gray-900" />
      default:
        return <User className="h-12 w-12 text-gray-900" />
    }
  }

  const getFeatureTitle = () => {
    switch (featureName) {
      case 'cart':
        return 'Access Your Shopping Cart'
      case 'wishlist':
        return 'Save to Your Wishlist'
      case 'account':
        return 'Access Your Account'
      default:
        return 'Login Required'
    }
  }

  const getFeatureDescription = () => {
    switch (featureName) {
      case 'cart':
        return 'Sign in to save your jewelry selections and proceed with secure checkout.'
      case 'wishlist':
        return 'Create an account to save your favorite pieces and access them from any device.'
      case 'account':
        return 'Sign in to manage your orders, track shipments, and update your preferences.'
      default:
        return 'Please sign in to continue.'
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />        {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out">
        {/* Close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Back
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Feature Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              {getFeatureIcon()}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
            {getFeatureTitle()}
          </h2>

          {/* Description */}
          <p className="text-gray-600 font-serif leading-relaxed mb-8">
            {getFeatureDescription()}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Login Button */}
            <button
              onClick={onLogin}
              className="w-full py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 font-serif"
            >
              <span>Sign In</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Signup Button */}
            <button
              onClick={onSignup}
              className="w-full py-4 text-gray-700 font-medium rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.98] font-serif"
            >
              Create Account
            </button>

            {/* Continue as Guest (for cart only) */}
            {featureName === 'cart' && (
              <button
                onClick={onClose}
                className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors font-serif"
              >
                Continue as guest
              </button>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-serif">
              {featureName === 'cart' 
                ? 'Members enjoy exclusive discounts and faster checkout'
                : featureName === 'wishlist'
                ? 'Save items across devices and get notified of sales'
                : 'Track orders and manage your jewelry collection'
              }
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

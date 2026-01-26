"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface MobilePageWrapperProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
}

export function MobilePageWrapper({ 
  children, 
  title, 
  showBackButton = false 
}: MobilePageWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    router.back()
  }

  return (
    <div 
      className={`min-h-screen transform transition-all duration-500 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-4 opacity-0'
      }`}
      style={{ background: '#f5f3ea' }}
    >
      {/* Mobile Header */}
      {(title || showBackButton) && (
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg 
                  className="w-6 h-6 text-gray-700" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
              </button>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">
                {title}
              </h1>
            )}
            {showBackButton && <div className="w-10" />} {/* Spacer for centering */}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

export default MobilePageWrapper

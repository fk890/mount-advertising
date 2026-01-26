'use client'

import { useEffect, useState } from 'react'

interface OrderSuccessBannerProps {
  orderId?: string
  amount?: string
}

export default function OrderSuccessBanner({ orderId, amount }: OrderSuccessBannerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Processing order confirmation...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">
            Your order has been successfully placed!
          </p>
          {orderId && (
            <p className="text-sm text-green-700 mt-1">
              Order ID: {orderId}
            </p>
          )}
          {amount && (
            <p className="text-sm text-green-700 mt-1">
              Total: {amount}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

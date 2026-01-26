import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import OrderSuccessBanner from '@/shop-components/OrderSuccessBanner'

export const metadata: Metadata = {
  title: 'Order Success - Mount Advertising',
  description: 'Thank you for your order! Your advertising product purchase has been confirmed.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <OrderSuccessBanner />
        </Suspense>
        
        <div className="max-w-2xl mx-auto text-center mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for choosing Mount Advertising. Your order has been successfully placed.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What&apos;s Next?
            </h2>
            <div className="text-left space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">1</span>
                </div>
                <p className="text-gray-700">
                  You&apos;ll receive an order confirmation email within 5 minutes
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">2</span>
                </div>
                <p className="text-gray-700">
                  Your product will be carefully prepared and packaged
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">3</span>
                </div>
                <p className="text-gray-700">
                  You&apos;ll receive tracking information once shipped
                </p>
              </div>
            </div>
          </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              Continue Shopping
            </Link>            <Link
              href="/track-order"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

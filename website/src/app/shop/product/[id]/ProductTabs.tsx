'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'shipping', label: 'Shipping & returns' },
  { id: 'care', label: 'Care & maintenance' },
  { id: 'gift', label: 'Gift-giving services' },
  { id: 'appointment', label: 'Book an appointment' },
]

interface ProductTabsProps {
  product: {
    description?: string
    specifications?: Record<string, string | undefined>
    rating?: number
    reviews?: number
    // NOTE: Detailed reviews are not in the data model.
  }
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description')

  return (
    <div id="reviews" className="mt-16">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}{tab.id === 'reviews' && product.reviews ? ` (${product.reviews})` : ''}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.description || 'Product description not available.'}
            </p>
            {product.specifications && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{value as string}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
            {product.reviews && product.reviews > 0 && product.rating ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <Star
                        key={rating}
                        className={`h-5 w-5 ${
                          product.rating! > rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{product.rating} out of 5 stars</p>
                </div>
                <p className="text-gray-700">Based on {product.reviews} reviews.</p>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  {/* This is a placeholder. The data model doesn't contain individual reviews. */}
                  <p className="text-gray-600 italic">Detailed reviews are not available at this time.</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">There are no reviews for this product yet.</p>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping & Returns</h3>
            <p className="text-gray-700">Free shipping on orders over $500. Returns accepted within 30 days.</p>
          </div>
        )}        {activeTab === 'care' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Care & Maintenance</h3>
            <div className="text-gray-700 space-y-6">
              <p>
                Mount Advertising products are built to last but should be handled with care. To ensure that your product 
                remains in the best possible condition over an extended period of time, please observe the advice below to avoid 
                damage:
              </p>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">LED & Neon Signs:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Unplug before cleaning. Use a soft, dry cloth to gently wipe the surface.</li>
                  <li>Avoid using water or chemical cleaners directly on electrical components.</li>
                  <li>Keep away from excessive moisture and extreme temperatures.</li>
                  <li>Handle neon tubing with care to avoid breakage.</li>
                  <li>Ensure proper ventilation around LED components to prevent overheating.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Banners & Displays:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Store banners rolled or flat in a dry location when not in use.</li>
                  <li>Clean with a damp cloth and mild soap solution if needed.</li>
                  <li>Avoid prolonged exposure to direct sunlight to prevent fading.</li>
                  <li>For display systems, check mounting hardware regularly for stability.</li>
                  <li>Keep displays away from heat sources and sharp objects.</li>
                </ul>
              </div>
              
              <p>
                <a href="#" className="text-gray-900 underline hover:text-gray-700">
                  Read more about caring for your Mount Advertising products here.
                </a>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'gift' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gift-Giving Services</h3>
            <p className="text-gray-700">Premium gift wrapping and personalized messages available.</p>
          </div>
        )}

        {activeTab === 'appointment' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Book an Appointment</h3>
            <p className="text-gray-700">Schedule a personal consultation with our jewelry experts.</p>
          </div>
        )}
      </div>
    </div>
  )
}

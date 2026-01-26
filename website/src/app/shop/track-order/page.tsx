'use client'

import { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import withAuth from '@/shop-utils/withAuth';

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: Array<{
    id: string
    name: string
    image: string
    price: number
    quantity: number
  }>
  trackingNumber?: string
  estimatedDelivery?: string
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

function OrderTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !searchEmail.trim()) {
      setError('Please enter both order number and email address')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/orders/track?orderNumber=${searchQuery}&email=${searchEmail}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResult(data.order)
      } else {
        setError(data.error || 'Order not found')
        setSearchResult(null)
      }    } catch {
      setError('Failed to search for order. Please try again.')
      setSearchResult(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <Package className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-serif mb-4">Track Your Order</h1>
          <p className="text-xl text-gray-600">
            Enter your order details to track your product shipment
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>                <input
                  type="text"
                  id="orderNumber"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. ZEV-2024-001234"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>                <input
                  type="email"
                  id="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Track Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Results */}
        {searchResult && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Order #{searchResult.orderNumber}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(searchResult.status)}`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(searchResult.status)}
                    {searchResult.status.charAt(0).toUpperCase() + searchResult.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Order Date:</span>
                  <p className="font-medium">{new Date(searchResult.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-medium">${searchResult.total.toFixed(2)}</p>
                </div>
                {searchResult.trackingNumber && (
                  <div>
                    <span className="text-gray-500">Tracking Number:</span>
                    <p className="font-medium">{searchResult.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 ${searchResult.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle className="h-5 w-5" />
                  <span>Order Delivered</span>
                </div>
                <div className={`flex items-center gap-3 ${['delivered', 'shipped'].includes(searchResult.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                  <Truck className="h-5 w-5" />
                  <span>Order Shipped</span>
                </div>
                <div className={`flex items-center gap-3 ${['delivered', 'shipped', 'processing'].includes(searchResult.status) ? 'text-yellow-600' : 'text-gray-400'}`}>
                  <Package className="h-5 w-5" />
                  <span>Order Processing</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="text-gray-600">
                <p>{searchResult.shippingAddress.name}</p>
                <p>{searchResult.shippingAddress.address}</p>
                <p>{searchResult.shippingAddress.city}, {searchResult.shippingAddress.state} {searchResult.shippingAddress.zipCode}</p>
              </div>
              {searchResult.estimatedDelivery && (
                <p className="text-sm text-gray-500 mt-2">
                  Estimated Delivery: {new Date(searchResult.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {searchResult.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      {/* Item image would go here */}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Email Support</p>
                <p className="text-sm text-gray-600">hello@mountadvertising.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Phone Support</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link 
              href="/support" 
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Visit our Support Center →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(OrderTrackingPage);

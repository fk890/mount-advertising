'use client'

import { useState, useEffect } from 'react'
import { Package, Clock, Truck, CheckCircle, Eye, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import withAuth from '@/shop-utils/withAuth'
import Image from 'next/image'

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
  shippingAddress?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get user data
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }

    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const generateMockOrders = (userData: any): Order[] => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    const fullName = userData ? `${userData.firstName} ${userData.lastName}` : 'Guest User';
    const address = userData?.address || {
      address: '123 Fifth Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    };

    const formatDate = (date: Date): string => date.toISOString().split('T')[0] ?? '';
    
    return [
      {
        id: 'order-1',
        orderNumber: 'ZVY-10458',
        date: formatDate(today),
        status: 'processing' as const,
        total: 599.00,
        items: [
          {
            id: 'diamond-ring-1',
            name: 'Diamond Eternity Ring',
            image: '/images/jewelry/rings/diamond-eternity-ring.jpg',
            price: 599.00,
            quantity: 1
          }
        ],
        shippingAddress: {
          name: fullName,
          address: address.address || '123 Fifth Avenue',
          city: address.city || 'New York',
          state: address.state || 'NY',
          zipCode: address.zipCode || '10001'
        }
      },
      {
        id: 'order-2',
        orderNumber: 'ZVY-10432',
        date: formatDate(oneWeekAgo),
        status: 'shipped' as const,
        total: 848.00,
        items: [
          {
            id: 'pearl-necklace-1',
            name: 'Pearl Strand Necklace',
            image: '/images/jewelry/necklaces/pearl-strand.jpg',
            price: 349.00,
            quantity: 1
          },
          {
            id: 'pearl-earrings-1',
            name: 'Pearl Drop Earrings',
            image: '/images/jewelry/earrings/pearl-drops.jpg',
            price: 499.00,
            quantity: 1
          }
        ],
        trackingNumber: 'UPS-7291836492',
        shippingAddress: {
          name: fullName,
          address: address.address || '123 Fifth Avenue',
          city: address.city || 'New York',
          state: address.state || 'NY',
          zipCode: address.zipCode || '10001'
        }
      },
      {
        id: 'order-3',
        orderNumber: 'ZVY-10401',
        date: formatDate(twoWeeksAgo),
        status: 'delivered' as const,
        total: 799.00,
        items: [
          {
            id: 'gold-bracelet-1',
            name: 'Gold Chain Bracelet',
            image: '/images/jewelry/bracelets/gold-chain.jpg',
            price: 799.00,
            quantity: 1
          }
        ],
        trackingNumber: 'UPS-6382947193',
        shippingAddress: {
          name: fullName,
          address: address.address || '123 Fifth Avenue',
          city: address.city || 'New York',
          state: address.state || 'NY',
          zipCode: address.zipCode || '10001'
        }
      }
    ];
  };

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Try to fetch from API
      const response = await fetch('/api/orders/user-history')
      const data = await response.json()
      
      if (data.success && data.orders && data.orders.length > 0) {
        setOrders(data.orders)
      } else {
        // If API fails or returns no orders, use mock data
        const storedUser = localStorage.getItem('user');
        const userData = storedUser ? JSON.parse(storedUser) : null;
        const mockOrders = generateMockOrders(userData);
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const mockOrders = generateMockOrders(userData);
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order History</h1>
          <p className="text-xl text-gray-600">
            Track all your product purchases and orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-medium text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-8">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #</p>
                      <p className="font-medium">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-1.5 text-sm font-medium capitalize`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {order.trackingNumber && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div>
                        <Link
                          href={`/track-order?tracking=${order.trackingNumber}`}
                          className="text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Track Package
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="px-6 py-4">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.id}`} className="py-4 flex items-center border-b border-gray-200 last:border-0">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-6">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="ml-auto">
                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Info */}
                {order.shippingAddress && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">{order.shippingAddress.name}</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default withAuth(OrderHistoryPage);

"use client";

import { User, Mail, Phone, MapPin, Package, ShoppingBag, Heart, LogOut, ChevronRight, Clock, CheckCircle, Truck, Box } from 'lucide-react'
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';

type UserData = {
  id?: string;
  token?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }
};

type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.replace('/shop/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setEditedUser(userData);
      fetchOrders(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.replace('/shop/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchOrders = async (userData: UserData) => {
    try {
      if (!userData?.token) {
        setOrders([]);
        return;
      }

      const queryParam = userData.id
        ? `userId=${encodeURIComponent(userData.id)}`
        : `email=${encodeURIComponent(userData.email)}`;

      const response = await fetch(`/api/orders?${queryParam}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Set sample orders for demo
      setOrders([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    router.replace('/shop');
  };

  const handleSaveProfile = () => {
    if (editedUser) {
      localStorage.setItem('user', JSON.stringify(editedUser));
      setUser(editedUser);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'processing': return 'text-blue-500 bg-blue-500/10';
      case 'shipped': return 'text-purple-500 bg-purple-500/10';
      case 'delivered': return 'text-green-500 bg-green-500/10';
      case 'cancelled': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Box className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c8ff00] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Account</h1>
            <p className="text-gray-400 mt-1">Manage your profile and orders</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors self-start sm:self-auto"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Profile updated successfully!
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto">
          {(['overview', 'orders', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-[#c8ff00] border-b-2 border-[#c8ff00]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* User Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#c8ff00]/20 to-[#c8ff00]/5 rounded-full flex items-center justify-center border border-[#c8ff00]/30">
                  <span className="text-2xl font-bold text-[#c8ff00]">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => setActiveTab('orders')}
                className="group bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-[#c8ff00]/50 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">My Orders</h3>
                      <p className="text-sm text-gray-500">{orders.length} orders</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#c8ff00] transition-colors" />
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('profile')}
                className="group bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-[#c8ff00]/50 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Edit Profile</h3>
                      <p className="text-sm text-gray-500">Update your info</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#c8ff00] transition-colors" />
                </div>
              </button>

              <Link 
                href="/shop"
                className="group bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-[#c8ff00]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Browse Products</h3>
                      <p className="text-sm text-gray-500">Continue shopping</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#c8ff00] transition-colors" />
                </div>
              </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">Recent Orders</h3>
                {orders.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-sm text-[#c8ff00] hover:underline"
                  >
                    View All
                  </button>
                )}
              </div>
              
              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No orders yet</p>
                  <Link 
                    href="/shop"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#c8ff00] text-black rounded-lg font-medium hover:bg-[#b8ef00] transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">#{order.orderNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">{order.items.length} item(s)</span>
                        <span className="font-medium text-white">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No orders yet</h3>
                <p className="text-gray-400 mb-6">When you place an order, it will appear here</p>
                <Link 
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#c8ff00] text-black rounded-lg font-medium hover:bg-[#b8ef00] transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-sm text-gray-400">Order #{order.orderNumber}</span>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="p-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-2">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden relative">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-white font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-800/30">
                    <span className="text-gray-400">Total</span>
                    <span className="text-lg font-semibold text-white">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Profile Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-[#c8ff00] hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editedUser?.firstName || ''}
                      onChange={(e) => setEditedUser(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#c8ff00]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editedUser?.lastName || ''}
                      onChange={(e) => setEditedUser(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#c8ff00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedUser?.email || ''}
                    disabled
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editedUser?.phone || ''}
                    onChange={(e) => setEditedUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#c8ff00]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setEditedUser(user);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-[#c8ff00] text-black font-medium rounded-lg hover:bg-[#b8ef00] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Full Name</p>
                    <p className="text-white">{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

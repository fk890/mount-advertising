'use client'

import { useState, useEffect } from 'react';
import { Eye, CheckCircle, Clock, DollarSign, ShoppingBag, AlertTriangle, ExternalLink } from 'lucide-react';

interface Customization {
  text?: string;
  font?: string;
  color?: string;
  boardType?: string;
  dimensions?: string;
  hasCustomDesign?: boolean;
  notes?: string;
  addOns?: string[];
}

interface OrderItem {
  id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  color?: string;
  customization?: Customization;
  custom_design_url?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  fulfillment_status: string;
  gift_packaging: boolean;
  gift_note?: string;
  promo_code?: string;
  promo_discount?: number;
  razorpay_payment_id?: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export function AdminOrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.data.orders);
          setStats({
            totalOrders: data.data.statistics.totalOrders,
            totalRevenue: data.data.statistics.totalRevenue,
            pendingOrders: data.data.statistics.pendingOrders,
            completedOrders: data.data.statistics.confirmedOrders + data.data.statistics.deliveredOrders
          });
        } else {
          console.error('Failed to fetch orders:', data.error);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  const updateOrderStatus = async (orderId: number, status: string, type: 'order' | 'fulfillment') => {
    try {
      const updateData: Record<string, unknown> = { orderId };
      
      if (type === 'order') {
        updateData.status = status;
      } else {
        updateData.fulfillmentStatus = status;
      }

      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state with the updated order
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                [type === 'order' ? 'order_status' : 'fulfillment_status']: status,
                updated_at: new Date().toISOString()
              }
            : order
        ));
        console.log(`Successfully updated order ${orderId} ${type} status to:`, status);
      } else {
        console.error('Failed to update order status:', result.error);
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.fulfillment_status === 'pending';
    if (filter === 'fulfilled') return order.fulfillment_status === 'fulfilled';
    if (filter === 'shipped') return order.order_status === 'shipped';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Order Management</h1>
        <div className="text-sm text-gray-500">
          {orders.length} total orders
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('fulfilled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'fulfilled' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Fulfilled
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'shipped' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Shipped
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">{order.order_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_first_name} {order.customer_last_name}
                      </div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </div>
                  </td>                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.fulfillment_status)}`}>
                      {order.fulfillment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {order.fulfillment_status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'fulfilled', 'fulfillment')}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Fulfill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{selectedOrder.id}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Custom Order Alert */}
              {selectedOrder.items?.some(item => item.customization || item.custom_design_url) && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                    <h3 className="text-amber-800 font-semibold">⚠️ Custom Order - Requires Attention</h3>
                  </div>
                  <p className="text-amber-700 text-sm mt-1">This order contains custom items with uploaded designs or special instructions.</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip_code}</p>
                </div>

                {/* Payment Info */}
                <div className="lg:col-span-2 bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-green-800">Payment Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Method:</span>
                      <p className="font-medium">{selectedOrder.payment_method?.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className={`font-medium ${selectedOrder.payment_status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                        {selectedOrder.payment_status?.toUpperCase()}
                      </p>
                    </div>
                    {selectedOrder.razorpay_payment_id && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Razorpay ID:</span>
                        <p className="font-mono text-xs">{selectedOrder.razorpay_payment_id}</p>
                      </div>
                    )}
                    {selectedOrder.promo_code && (
                      <>
                        <div>
                          <span className="text-gray-500">Promo:</span>
                          <p className="font-medium text-green-600">{selectedOrder.promo_code}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Discount:</span>
                          <p className="font-medium text-green-600">-₹{selectedOrder.promo_discount?.toFixed(2)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-lg">{item.product_name}</p>
                            <p className="text-sm text-gray-500">
                              SKU: {item.product_id} | Qty: {item.quantity}
                              {item.size && ` | Size: ${item.size}`}
                              {item.color && ` | Color: ${item.color}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{item.total_price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">₹{item.unit_price.toFixed(2)} each</p>
                          </div>
                        </div>
                        
                        {/* Customization Details */}
                        {item.customization && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">📝 Customization Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {item.customization.text && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Text:</span>
                                  <p className="font-medium">&quot;{item.customization.text}&quot;</p>
                                </div>
                              )}
                              {item.customization.font && (
                                <div>
                                  <span className="text-gray-600">Font:</span>
                                  <p className="font-medium">{item.customization.font}</p>
                                </div>
                              )}
                              {item.customization.color && (
                                <div>
                                  <span className="text-gray-600">Color:</span>
                                  <p className="font-medium">{item.customization.color}</p>
                                </div>
                              )}
                              {item.customization.boardType && (
                                <div>
                                  <span className="text-gray-600">Board Type:</span>
                                  <p className="font-medium">{item.customization.boardType}</p>
                                </div>
                              )}
                              {item.customization.dimensions && (
                                <div>
                                  <span className="text-gray-600">Dimensions:</span>
                                  <p className="font-medium">{item.customization.dimensions}</p>
                                </div>
                              )}
                              {item.customization.notes && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Notes:</span>
                                  <p className="font-medium">{item.customization.notes}</p>
                                </div>
                              )}
                              {item.customization.addOns && item.customization.addOns.length > 0 && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Add-ons:</span>
                                  <p className="font-medium">{item.customization.addOns.join(', ')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Custom Design Link */}
                        {item.custom_design_url && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-800 mb-2">🎨 Uploaded Design</h4>
                            <a 
                              href={item.custom_design_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Customer Design
                            </a>
                            <div className="mt-2">
                              <img 
                                src={item.custom_design_url} 
                                alt="Customer design"
                                className="max-w-xs rounded border"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )) || <p className="text-gray-500 italic">No items found</p>}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-2 bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total: ₹{selectedOrder.total_amount.toFixed(2)}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.fulfillment_status)}`}>
                      {selectedOrder.fulfillment_status}
                    </span>
                  </div>
                  {selectedOrder.gift_note && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <p className="text-sm"><strong>🎁 Gift Note:</strong> {selectedOrder.gift_note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                {selectedOrder.fulfillment_status === 'pending' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'fulfilled', 'fulfillment');
                      setSelectedOrder(null);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Fulfilled
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

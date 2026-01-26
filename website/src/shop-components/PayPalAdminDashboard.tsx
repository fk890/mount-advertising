"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface PayPalTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string;
  createdAt: string;
  paypalId: string;
}

interface OrderData {
  id: string;
  order_number?: string;
  total_price: string;
  status: string;
  customer_info?: { email?: string };
  created_at: string;
  payment_details?: { paypalOrderId?: string };
  payment_method: string;
  is_paid: boolean;
}

interface ApiResponse {
  success: boolean;
  data: OrderData[];
}

export default function PayPalAdminDashboard() {
  const [transactions, setTransactions] = useState<PayPalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    fetchPayPalData();
  }, []);

  const fetchPayPalData = async () => {
    try {
      // Fetch PayPal transactions from your orders
      const response = await fetch('/api/orders?paymentMethod=paypal');
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        const paypalOrders = data.data.filter((order: OrderData) => 
          order.payment_method === 'paypal' && order.is_paid
        );
        
        // Transform to transaction format
        const txns = paypalOrders.map((order: OrderData) => ({
          id: order.id,
          orderId: order.order_number || order.id,
          amount: parseFloat(order.total_price),
          currency: 'USD',
          status: order.status,
          customerEmail: order.customer_info?.email || 'N/A',
          createdAt: order.created_at,
          paypalId: order.payment_details?.paypalOrderId || 'N/A'
        }));
        
        setTransactions(txns);
        
        // Calculate stats
        const totalRevenue = txns.reduce((sum: number, txn: PayPalTransaction) => sum + txn.amount, 0);
        const totalTransactions = txns.length;
        const successRate = totalTransactions > 0 ? 100 : 0; // All fetched are successful
        const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        setStats({
          totalRevenue,
          totalTransactions,
          successRate,
          avgOrderValue
        });
      }
    } catch (error) {
      console.error('Error fetching PayPal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'processing':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">PayPal Dashboard</h1>
        <p className="text-gray-600 font-serif">Monitor PayPal transactions and revenue</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-serif">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 font-serif">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-serif">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 font-serif">
                {stats.totalTransactions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-serif">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 font-serif">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-serif">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 font-serif">
                {formatCurrency(stats.avgOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 font-serif">Recent PayPal Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif">
                  PayPal ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-serif">
                    No PayPal transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-serif">
                      #{transaction.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-serif">
                      {transaction.customerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-serif">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)} font-serif`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {transaction.paypalId.length > 15 
                        ? `${transaction.paypalId.substring(0, 15)}...` 
                        : transaction.paypalId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-serif">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PayPal Integration Status */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h3 className="ml-2 text-lg font-semibold text-blue-900 font-serif">PayPal Integration Status</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700 font-serif">Environment</p>
            <p className="text-blue-900 font-serif">
              {process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 font-serif">Client ID</p>
            <p className="text-blue-900 font-mono text-sm">
              {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 
                `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID.substring(0, 20)}...` : 
                'Not configured'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 font-serif">Webhook Status</p>
            <p className="text-blue-900 font-serif">
              {process.env.PAYPAL_WEBHOOK_ID ? 'Configured' : 'Not configured'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AdminOrdersManagement } from '@/shop-components/AdminOrdersManagement';

export default function AdminOrders() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-serif mb-6">Manage Orders</h1>
      <p className="text-gray-600 font-serif mb-4">View and manage customer orders with complete order tracking.</p>
      <AdminOrdersManagement />
    </div>
  );
}

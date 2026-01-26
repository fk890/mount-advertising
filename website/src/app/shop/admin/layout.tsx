import Link from 'next/link';
import AdminAuthGuard from '@/shop-components/AdminAuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-stone-100">
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex space-x-8">
          <Link href="/shop/admin" className="font-bold text-gray-900 font-serif">Dashboard</Link>
          <Link href="/shop/admin/products" className="text-gray-700 font-serif">Products</Link>
          <Link href="/shop/admin/orders" className="text-gray-700 font-serif">Orders</Link>
          <Link href="/shop/admin/payments" className="text-gray-700 font-serif">Payments</Link>
          <Link href="/shop/admin/users" className="text-gray-700 font-serif">Users</Link>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}

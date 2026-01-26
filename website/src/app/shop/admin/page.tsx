export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-serif mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 font-serif">Products</h2>
          <p className="text-gray-600 mb-4 font-serif">Manage all advertising products in your store.</p>
          <a href="/shop/admin/products" className="text-blue-600 font-serif hover:underline">Go to Products</a>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 font-serif">Orders</h2>
          <p className="text-gray-600 mb-4 font-serif">View and manage customer orders.</p>
          <a href="/shop/admin/orders" className="text-blue-600 font-serif hover:underline">Go to Orders</a>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 font-serif">Users</h2>
          <p className="text-gray-600 mb-4 font-serif">Manage customer and admin accounts.</p>
          <a href="/shop/admin/users" className="text-blue-600 font-serif hover:underline">Go to Users</a>
        </div>
      </div>
    </div>
  );
}


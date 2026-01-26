'use client';

import ProductForm from '@/shop-components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Add New Product</h1>
        <p className="text-gray-600 mt-1">Create a new advertising product for Mount Advertising</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}

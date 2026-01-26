"use client"

import ShowcaseProductCard from '@/shop-components/ShowcaseProductCard'
import { CategoryCircleRow } from '@/shop-components/CategoryCircleRow'
import { useState, useEffect } from 'react'
import { Product } from '@/shop-types/Product'

export default function Displays() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?category=displays');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 lg:pt-24">
      <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
            Display Solutions
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-montserrat)" }}>
            Professional display solutions for your advertising needs.
          </p>
        </div>

        <CategoryCircleRow />

        {/* Products Count */}
        <div className="mb-8">
          <p className="text-sm text-gray-400" style={{ fontFamily: "var(--font-montserrat)" }}>
            {loading ? 'Loading...' : `${products.length} Results`}
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[4px]">
            {products.map((product, index) => (
              <ShowcaseProductCard
                key={product.id}
                id={String(product.id)}
                name={product.name}
                description={product.description}
                price={typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.-]/g, '')) : product.price}
                image={product.images?.[0] || product.image || '/images/world.svg'}
                images={product.images}
                isNew={product.isNew}
                colors={product.colors}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-4">No display products found. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client"

import { useState, useEffect } from 'react'
import ProductCard from '@/shop-components/ProductCard'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
}

export default function CafePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?category=cafe')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        const fetched = data.products || []
        const filtered = fetched.filter((product: Product) => {
          const category = (product.category || '').toLowerCase().trim()
          const collection = (product as any).collection ? String((product as any).collection).toLowerCase().trim() : ''
          const id = product.id?.toLowerCase() || ''
          return category === 'cafe' || collection === 'cafe' || id.startsWith('cafe-')
        })
        setProducts(filtered)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', paddingTop: '100px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
            Cafe Neon Signs
          </h1>
          <p style={{ fontSize: '18px', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto' }}>
            Transform your cafe with stunning neon signs. Perfect for restaurants, bakeries, and food businesses.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#9CA3AF' }}>Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                href={`/shop/cafe/${product.id}`}
                name={product.name}
                image={product.images?.[0] || '/shop/placeholder.webp'}
                price={product.price}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#9CA3AF', fontSize: '18px' }}>No cafe products available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

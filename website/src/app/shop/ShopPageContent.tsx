"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProductCard from '@/shop-components/ProductCard'

type ApiProduct = {
  id: string
  name: string
  description?: string
  price: number
  images?: string[]
  category?: string
  collection?: string
}

const categories = [
  { name: 'Shop All', href: '/shop', image: '/shop/customise-your-own.webp', active: true },
  { name: 'Cafe', href: '/shop/cafe', image: '/shop/circle-cafe.webp', active: false },
  { name: 'Gaming', href: '/shop/gaming', image: '/shop/circle-gaming.webp', active: false },
]

export default function ShopPageContent() {
  const [randomProducts, setRandomProducts] = useState<ApiProduct[]>([])

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=20')
        if (!response.ok) return
        const data = await response.json()
        const products: ApiProduct[] = data.products || []
        // De-dupe and prefer one cafe + one gaming item
        const filtered = products.filter((product) => {
          const category = (product.category || '').toLowerCase().trim()
          const collection = (product.collection || '').toLowerCase().trim()
          const id = product.id?.toLowerCase() || ''
          const isExcluded = category === 'neon-signage' || category === 'led-boards' || collection === 'neon-signage' || collection === 'led-boards'
          const isCafe = category === 'cafe' || collection === 'cafe' || id.startsWith('cafe-')
          const isGaming = category === 'gaming' || collection === 'gaming' || id.startsWith('gaming-')
          return !isExcluded && (isCafe || isGaming)
        })
        const unique = Array.from(new Map(filtered.map((p) => [p.id, p])).values())

        const cafeItem = unique.find((p) => (p.category || '').toLowerCase().includes('cafe') || (p.collection || '').toLowerCase().includes('cafe') || p.id.toLowerCase().startsWith('cafe-'))
        const gamingItem = unique.find((p) => (p.category || '').toLowerCase().includes('gaming') || (p.collection || '').toLowerCase().includes('gaming') || p.id.toLowerCase().startsWith('gaming-'))

        const picked: ApiProduct[] = []
        if (cafeItem) picked.push(cafeItem)
        if (gamingItem && gamingItem.id !== cafeItem?.id) picked.push(gamingItem)

        if (picked.length < 2) {
          const remaining = unique.filter((p) => !picked.some((q) => q.id === p.id))
          picked.push(...remaining.slice(0, 2 - picked.length))
        }

        setRandomProducts(picked.slice(0, 2))
      } catch (error) {
        console.error('Failed to load random products', error)
      }
    }
    fetchRandomProducts()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      {/* Category Circles Row */}
      <div style={{ width: '100%', backgroundColor: '#000', padding: '32px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: cat.active ? '3px solid #c8ff00' : '2px solid #666',
                  position: 'relative',
                }}>
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="96px"
                  />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: cat.active ? '#c8ff00' : '#fff' }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {/* Product Card */}
          <ProductCard
            href="/shop/neon-signage"
            name="Customise Neon Sign"
            image="/shop/customise-your-own.webp"
            price={3000}
            originalPrice={4285}
            priority
          />
          {/* Product Card */}
          <ProductCard
            href="/shop/led-boards"
            name="Customise LED Signage Board"
            image="/shop/customise-your-own.webp"
            price={3000}
            originalPrice={4285}
            priority
          />
          {randomProducts.map((product) => (
            <ProductCard
              key={product.id}
              href={product.id.startsWith('cafe-') ? `/shop/cafe/${product.id}` : `/shop/gaming/${product.id}`}
              name={product.name}
              image={product.images?.[0] || '/shop/placeholder.webp'}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
